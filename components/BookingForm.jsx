"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function Msg({ kind = "info", children }) {
  const cls =
    kind === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : kind === "error"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : "bg-zinc-50 text-zinc-800 border-zinc-200";
  return (
    <div className={`mt-3 rounded border px-3 py-2 text-sm ${cls}`}>{children}</div>
  );
}

/**
 * Props:
 *   listingId: string (required)
 *   priceCents?: number (optional – for showing total)
 */
export default function BookingForm({ listingId, priceCents }) {
  const [session, setSession] = useState(null);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // {kind: 'success'|'error'|'info', text: string}

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);

    if (!session?.user) {
      setMsg({ kind: "error", text: "Please sign in to book." });
      return;
    }
    if (!listingId || !startAt || !endAt) {
      setMsg({ kind: "error", text: "Please choose start and end time." });
      return;
    }

    setBusy(true);

    // You can compute a total here. For demo we just pass 0 or priceCents.
    const total_cents = priceCents ?? 0;

    const payload = {
      listing_id: listingId,
      guest_id: session.user.id,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      guests: Number(guests) || 1,
      note,
      total_cents,
      status: "pending",
    };

    const { error } = await supabase.from("bookings").insert(payload);

    setBusy(false);

    if (error) {
      // Exclusion constraint error code from Postgres is 23P01.
      // Supabase forwards Postgres codes on error.code (or message text contains the constraint name).
      const isOverlap =
        error.code === "23P01" ||
        (error.message && /bookings_no_overlap_gist/i.test(error.message)) ||
        (error.details && /overlap/i.test(error.details));

      if (isOverlap) {
        setMsg({
          kind: "error",
          text: "That time overlaps an existing booking. Please choose another time.",
        });
      } else if (error.code === "42501") {
        setMsg({
          kind: "error",
          text:
            "Permission denied. You may need to verify that you are 18+ and not booking your own listing.",
        });
      } else if (error.code === "23514") {
        setMsg({ kind: "error", text: "Invalid dates. Start must be before end." });
      } else if (error.code === "23503") {
        setMsg({ kind: "error", text: "Listing not found." });
      } else {
        setMsg({ kind: "error", text: error.message || "Booking failed." });
      }
      return;
    }

    // Success
    setMsg({ kind: "success", text: "Request sent! The host will review your booking." });
    setNote("");
    // keep dates so user sees what they requested, or clear them if you prefer:
    // setStartAt(""); setEndAt("");
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Start</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded border px-3 py-2"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">End</label>
        <input
          type="datetime-local"
          className="mt-1 w-full rounded border px-3 py-2"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Guests</label>
        <input
          type="number"
          min={1}
          className="mt-1 w-32 rounded border px-3 py-2"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
        <textarea
          className="mt-1 w-full rounded border px-3 py-2"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
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