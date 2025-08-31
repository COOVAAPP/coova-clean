// app/api/bookings/create/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  // Use cookies-based auth if you later swap to server auth helpers
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * POST JSON:
 * { listingId, ownerId, startsAt, endsAt, pricePerHourCents }
 */
export async function POST(req) {
  try {
    const supabase = getClient(req);
    const body = await req.json();

    const { listingId, ownerId, startsAt, endsAt, pricePerHourCents } = body || {};
    if (!listingId || !ownerId || !startsAt || !endsAt || !pricePerHourCents) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Who is the caller (guest)?
    const { data: sessionData, error: sErr } = await supabase.auth.getSession();
    if (sErr) throw sErr;
    const guestId = sessionData?.session?.user?.id;
    if (!guestId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const s = new Date(startsAt);
    const e = new Date(endsAt);
    if (!(s instanceof Date) || !(e instanceof Date) || isNaN(s) || isNaN(e) || e <= s) {
      return NextResponse.json({ error: "Invalid times" }, { status: 400 });
    }

    const hours = (e - s) / (1000 * 60 * 60);
    if (hours <= 0) return NextResponse.json({ error: "Duration must be > 0" }, { status: 400 });

    const total = Math.round(hours * Number(pricePerHourCents));

    // Insert booking (exclusion constraint prevents overlap)
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        owner_id: ownerId,
        guest_id: guestId,
        starts_at: s.toISOString(),
        ends_at: e.toISOString(),
        hours,
        total_cents: total,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      // prettify overlap error
      if (String(error.message || "").includes("bookings_no_overlap")) {
        return NextResponse.json(
          { error: "Those times are already booked. Try another slot." },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}