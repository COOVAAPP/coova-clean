"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/** Little message box */
function Msg({ kind = "info", children }) {
  const cls =
    kind === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : kind === "error"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : "bg-zinc-50 text-zinc-800 border-zinc-200";
  return <div className={`mt-3 rounded border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

/**
 * BookingForm
 * Props:
 *  - listingId   (string, required)
 *  - priceCents  (number, required)  // hourly price in cents
 *  - ownerId     (string, required)  // host user id (to block self-booking in UI)
 *  - onSuccessRedirect (string, optional) e.g. "/dashboard/bookings"
 */
export default function BookingForm({ listingId, priceCents, ownerId, onSuccessRedirect = "/dashboard/bookings" }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // {kind, text}

  // datetime-local fields
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // other fields
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");

  // min attribute for datetime-local (rounded to next 10 minutes)
  const minLocal = useMemo(() => {
    const d = new Date();
    const ms = 10 * 60 * 1000;
    const rounded = new Date(Math.ceil(d.getTime() / ms) * ms);
    return toLocalInputValue(rounded);
  }, []);

  // auth
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // derived: hours + total
  const hours = useMemo(() => {
    const a = parseLocalDate(startAt);
    const b = parseLocalDate(endAt);
    if (!a || !b || b <= a) return 0;
    const diffHrs = (b - a) / (1000 * 60 * 60);
    return Math.max(1, Math.ceil(diffHrs)); // round up, min 1 hour
  }, [startAt, endAt]);

  const totalCents = useMemo(() => (priceCents && hours ? hours * priceCents : 0), [priceCents, hours]);
  const totalLabel = useMemo(
    () => (totalCents > 0 ? (totalCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—"),
    [totalCents]
  );

  function show(kind, text) {
    setMsg({ kind, text });
    if (kind !== "error") setTimeout(() => setMsg(null), 2400);
  }

  function validateClient() {
    if (!session?.user) { show("error", "Please sign in to book."); return false; }
    if (ownerId && session.user.id === ownerId) { show("error", "You can’t book your own listing."); return false; }
    if (!startAt || !endAt) { show("error", "Please choose start and end time."); return false; }

    const start = parseLocalDate(startAt);
    const end = parseLocalDate(endAt);
    const now = new Date();

    if (start <= now) { show("error", "Start time must be in the future."); return false; }
    if (end <= start) { show("error", "End time must be after start time."); return false; }

    const diffHrs = (end - start) / (1000 * 60 * 60);
    if (diffHrs < 1) { show("error", "Minimum booking is 1 hour."); return false; }

    return true;
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!validateClient()) return;

    setBusy(true);
    try {
      const payload = {
        listing_id: listingId,
        guest_id: session.user.id,
        start_at: parseLocalDate(startAt).toISOString(),
        end_at: parseLocalDate(endAt).toISOString(),
        guests: Number(guests) || 1,
        note: note.trim() || null,
        total_cents: totalCents,
        status: "pending",
      };

      const { error } = await supabase.from("bookings").insert(payload);

      if (error) {
        const isOverlap =
          error.code === "23P01" ||
          (error.message && /bookings_no_overlap_gist/i.test(error.message)) ||
          (error.details && /overlap/i.test(error.details));
        if (isOverlap) {
          show("error", "That time overlaps an existing booking. Please choose another time.");
        } else if (error.code === "42501") {
          show("error", "Permission denied. Verify you’re 18+ and not booking your own listing.");
        } else if (error.code === "23514") {
          show("error", "Invalid dates. Start must be before end.");
        } else if (error.code === "23503") {
          show("error", "Listing not found.");
        } else {
          show("error", error.message || "Booking failed.");
        }
        return;
      }

      show("success", "✅ Request sent! Redirecting…");
      setTimeout(() => { router.push(onSuccessRedirect); }, 900);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            min={minLocal}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            min={startAt || minLocal}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-32 rounded border px-3 py-2"
          />
        </div>
        <div className="self-end">
          <p className="text-sm text-gray-600">
            Total ({hours || "—"} hour{hours === 1 ? "" : "s"}):{" "}
            <span className="font-semibold">{totalLabel}</span>
          </p>
          <p className="text-xs text-gray-500">
            ${((priceCents ?? 0) / 100).toLocaleString()} / hour
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message to host (optional)</label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="Anything the host should know?"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="rounded bg-cyan-500 px-4 py-2 font-semibold text-white disabled:opacity-50 hover:opacity-90"
      >
        {busy ? "Sending…" : "Request to book"}
      </button>

      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}
    </form>
  );
}

/* ---------- helpers ---------- */

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parseLocalDate(value) {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
}