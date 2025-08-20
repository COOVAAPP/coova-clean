"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function BookListingPage({ params }) {
  const listingId = params.id;
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState("1");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idFile, setIdFile] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent(`/list/${listingId}/book`)}`);
        return;
      }
      setUserId(session.user.id);

      const { data: l, error } = await supabase
        .from("listings")
        .select("id,title,price")
        .eq("id", listingId)
        .single();
      if (error) {
        alert("Listing not found");
        router.replace("/");
        return;
      }
      if (active) {
        setListing(l);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [listingId, router]);

  const canSubmit = useMemo(() => {
    return !!(date && startTime && endTime && Number(guests) > 0 && phone.trim());
  }, [date, startTime, endTime, guests, phone]);

  function toIso(dateStr, timeStr) {
    // treat as local time then to ISO
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(dateStr);
    d.setHours(h || 0, m || 0, 0, 0);
    return d.toISOString();
  }

  async function uploadIdIfPresent() {
    if (!idFile) return null;
    const key = `user/${userId}/ids/${Date.now()}-${idFile.name}`;
    const { error } = await supabase.storage.from("user-ids").upload(key, idFile, {
      cacheControl: "0",
      upsert: false,
    });
    if (error) throw error;
    const { data } = await supabase.storage.from("user-ids").createSignedUrl(key, 60 * 60 * 24 * 7); // 7 days
    // store the signed URL reference for staff review
    const { error: vErr } = await supabase
      .from("user_verifications")
      .insert({ user_id: userId, id_url: data.signedUrl });
    if (vErr) throw vErr;
    return data.signedUrl;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await uploadIdIfPresent();

      const startTs = toIso(date, startTime);
      const endTs = toIso(date, endTime);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          startTs,
          endTs,
          guests: Number(guests),
          phone: phone.trim(),
          address: address.trim() || null,
          userId
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");

      window.location.href = json.url; // Stripe Checkout
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="container-page py-10"><p>Loading…</p></main>;
  }

  return (
    <main className="container-page py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Book: {listing.title}</h1>
      <p className="text-gray-600 mb-8">${listing.price} / hour</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End</label>
            <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Guests</label>
            <input type="number" min="1" value={guests} onChange={(e)=>setGuests(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2" required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="(555) 123-4567" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Street, City, State" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Photo ID (optional)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setIdFile(e.target.files?.[0]||null)} />
          <p className="text-xs text-gray-500 mt-1">Accepted: JPG, PNG, PDF. Stored securely for verification.</p>
        </div>

        <button type="submit" disabled={!canSubmit || submitting}
          className="px-5 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Redirecting…" : "Continue to Payment"}
        </button>
      </form>
    </main>
  );
}