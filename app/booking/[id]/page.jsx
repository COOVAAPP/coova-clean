"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const IMG_BUCKET = "listing-images";

export default function BookingPage() {
  const { id: listingId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [listing, setListing] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [date, setDate] = useState("");
  const [start, setStart] = useState(""); // "13:00"
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      // must be logged in and 18+
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("verified_18")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!prof?.verified_18) {
        router.replace("/verify-age");
        return;
      }

      setSession(data.session);

      // fetch listing
      const { data: l, error } = await supabase
        .from("listings")
        .select("id, owner_id, title, price_per_hour, address, images")
        .eq("id", listingId)
        .maybeSingle();

      if (error || !l) {
        router.replace("/not-found");
        return;
      }

      const urls = (l.images || []).map(
        (p) => supabase.storage.from(IMG_BUCKET).getPublicUrl(p).data.publicUrl
      );

      if (!mounted) return;
      setListing(l);
      setImageUrls(urls);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [listingId, router]);

  const pricePerHour = useMemo(() => {
    if (!listing) return 0;
    return listing.price_per_hour || 0;
  }, [listing]);

  const totalCents = useMemo(() => {
    const startAt = combine(date, start);
    const endAt = combine(date, end);
    if (!startAt || !endAt || endAt <= startAt) return 0;
    const hoursFloat = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
    const hours = Math.max(1, Math.ceil(hoursFloat)); // round up, min 1
    return hours * pricePerHour;
  }, [date, start, end, pricePerHour]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!session || !listing) return;

    const startAt = combine(date, start);
    const endAt = combine(date, end);

    if (!startAt || !endAt) {
      showToast("Please choose a date and time range.");
      return;
    }
    if (endAt <= startAt) {
      showToast("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      // conflict check — any booking overlapping this time?
      const { data: conflicts, error: cErr } = await supabase
        .from("bookings")
        .select("id, start_at, end_at, status")
        .eq("listing_id", listing.id)
        .in("status", ["pending", "accepted"])
        .gte("end_at", startAt.toISOString())
        .lte("start_at", endAt.toISOString());

      // Note: quick heuristic; for robust overlap we could fetch a broader window and filter here.
      if (cErr) throw cErr;

      // Extra local overlap filter
      const realOverlap = (conflicts || []).some((b) =>
        rangesOverlap(startAt, endAt, new Date(b.start_at), new Date(b.end_at))
      );
      if (realOverlap) {
        showToast("That time overlaps an existing booking. Try a different slot.");
        setSubmitting(false);
        return;
      }

      // Create booking (pending)
      const { error: insErr } = await supabase.from("bookings").insert({
        listing_id: listing.id,
        guest_id: session.user.id,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        guests,
        note: note.trim() || null,
        status: "pending",
        total_cents: totalCents,
      });
      if (insErr) throw insErr;

      showToast("✅ Request sent to host!");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Request to book</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  const cover = imageUrls[0];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{listing.title}</h1>
            <p className="text-gray-600">{listing.address || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-2xl font-extrabold">
              {(pricePerHour / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
              <span className="ml-1 text-sm text-gray-500">/ hour</span>
            </p>
          </div>
        </div>

        {/* Image */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mt-4 h-64 w-full rounded-lg object-cover" />
        )}

        {/* Form */}
        <form onSubmit={submitBooking} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Start time</label>
            <input
              type="time"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">End time</label>
            <input
              type="time"
              required
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Guests</label>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Message to host (optional)</label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              placeholder="Tell the host about your event…"
            />
          </div>

          {/* Summary */}
          <div className="sm:col-span-2 flex items-center justify-between rounded-md border px-4 py-3 bg-gray-50">
            <p className="text-sm text-gray-600">
              Total ({durationLabel(date, start, end)}):{" "}
              <span className="font-semibold">
                {(totalCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
              </span>
            </p>
            <button
              type="submit"
              disabled={submitting || !date || !start || !end || totalCents <= 0}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Request to book"}
            </button>
          </div>
        </form>

        {toast && (
          <div className="mt-3 rounded-md border border-gray-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

function combine(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // Build an ISO timestamp in local time then convert to Date
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr + "T00:00:00");
  d.setHours(h, m, 0, 0);
  return d;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd; // [aStart, aEnd) vs [bStart, bEnd)
}

function durationLabel(dateStr, startStr, endStr) {
  const a = combine(dateStr, startStr);
  const b = combine(dateStr, endStr);
  if (!a || !b || b <= a) return "—";
  const h = (b - a) / (1000 * 60 * 60);
  return `${Math.max(1, Math.ceil(h))} hour${h > 1 ? "s" : ""}`;
}