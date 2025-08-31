// components/BookingForm.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Props:
 *  - listingId (uuid)
 *  - ownerId   (uuid)
 *  - priceCents (integer cents per hour)
 *  - onSuccessRedirect (string) optional
 */
export default function BookingForm({
  listingId,
  ownerId,
  priceCents = 0,
  onSuccessRedirect = "/dashboard/bookings",
}) {
  const [date, setDate] = useState("");          // yyyy-mm-dd
  const [start, setStart] = useState("10:00");   // HH:mm (24h)
  const [end, setEnd] = useState("12:00");       // HH:mm
  const [blocks, setBlocks] = useState([]);      // unavailable intervals
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // load availability blocks for the visible month window
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (!listingId) return;
      try {
        const today = new Date();
        const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
        const to = new Date(today.getFullYear(), today.getMonth()+3, 0).toISOString().slice(0,10);

        const res = await fetch(
          `/api/bookings/availability?listingId=${listingId}&from=${from}&to=${to}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const json = await res.json();
        if (res.ok) setBlocks(json.blocks || []);
      } catch {}
    })();
    return () => controller.abort();
  }, [listingId]);

  const hours = useMemo(() => {
    if (!date || !start || !end) return 0;
    const s = new Date(`${date}T${start}:00`);
    const e = new Date(`${date}T${end}:00`);
    const diff = (e - s) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  }, [date, start, end]);

  const total = useMemo(() => Math.round(hours * priceCents), [hours, priceCents]);

  function fmtMoney(cents) {
    return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  const slotConflicts = useMemo(() => {
    if (!date || !start || !end) return false;
    const s = new Date(`${date}T${start}:00Z`);
    const e = new Date(`${date}T${end}:00Z`);
    return (blocks || []).some((b) => {
      const bs = new Date(b.start);
      const be = new Date(b.end);
      return s < be && e > bs; // ranges overlap
    });
  }, [blocks, date, start, end]);

  async function submit() {
    setErr("");
    setOkMsg("");

    try {
      setPending(true);

      // Make sure signed-in
      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session?.user) {
        setErr("Please sign in first.");
        return;
      }
      if (!date || !start || !end) {
        setErr("Choose a date, start, and end time.");
        return;
      }
      if (hours <= 0) {
        setErr("End time must be after start time.");
        return;
      }
      if (slotConflicts) {
        setErr("That time overlaps an existing booking.");
        return;
      }

      const startsAtLocal = new Date(`${date}T${start}:00`);
      const endsAtLocal = new Date(`${date}T${end}:00`);

      const payload = {
        listingId,
        ownerId,
        startsAt: startsAtLocal.toISOString(),
        endsAt: endsAtLocal.toISOString(),
        pricePerHourCents: priceCents,
      };

      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Failed to create booking");

      setOkMsg("Booking request sent! We’ll redirect you…");
      setTimeout(() => {
        window.location.href = onSuccessRedirect;
      }, 900);
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Date */}
      <label className="block">
        <span className="block text-xs font-semibold text-gray-600">Date</span>
        <input
          type="date"
          className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0,10)}
        />
      </label>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600">Start</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600">End</span>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </label>
      </div>

      {/* Summary */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
        <div className="flex justify-between">
          <span>Hours</span>
          <span className="font-semibold">{hours.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Rate</span>
          <span className="font-semibold">{fmtMoney(priceCents)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2">
          <span>Total</span>
          <span className="font-bold">{fmtMoney(total)}</span>
        </div>
      </div>

      {/* Status */}
      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {slotConflicts && !err && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Selected time overlaps an existing booking.
        </div>
      )}
      {okMsg && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {okMsg}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={submit}
        disabled={pending || hours <= 0 || slotConflicts}
        className="w-full rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Request booking"}
      </button>

      <p className="mt-2 text-[11px] text-gray-500">
        Your request will be sent to the host. No charges yet. (We’ll add payment capture later.)
      </p>
    </div>
  );
}