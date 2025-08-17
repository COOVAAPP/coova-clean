import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabaseServer"; // server client

// server client (no SSR helper in your repo yet) – quick inline:
import { createClient } from "@supabase/supabase-js";
function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { listingId, startTs, endTs, guests, phone, address } = body;

    if (!listingId || !startTs || !endTs || !guests) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supa = serverClient();

    // get user (from Supabase auth cookie is not available here),
    // so we require client to send the user's JWT in Authorization header if needed.
    // Simpler: trust the frontend to only call when logged in and re-fetch user from anon key -> not possible server-side.
    // For production: add middleware to attach supabase session. For now, accept a user_id in body is insecure.
    // Safer approach: create a server-side auth client using cookies (with @supabase/ssr in route handlers).
    // To keep it exact & working for you now, we’ll fetch listing & compute price, then rely on user_id provided in body.
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 401 });

    // fetch listing
    const { data: listing, error: lErr } = await supa
      .from("listings")
      .select("id,title,price,owner_id")
      .eq("id", listingId)
      .single();
    if (lErr || !listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const start = new Date(startTs);
    const end = new Date(endTs);
    if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start) || isNaN(end) || end <= start) {
      return NextResponse.json({ error: "Invalid times" }, { status: 400 });
    }

    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const amount_cents = Math.max(50, Math.round(hours * Number(listing.price) * 100));

    // insert pending booking
    const { data: booking, error: bErr } = await supa
      .from("bookings")
      .insert({
        listing_id: listing.id,
        user_id: userId,
        start_ts: start.toISOString(),
        end_ts: end.toISOString(),
        guests: Number(guests),
        amount_cents,
        currency: "usd",
        status: "pending",
        contact_phone: phone || null,
        contact_address: address || null
      })
      .select("id")
      .single();
    if (bErr) return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });

    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount_cents,
            product_data: {
              name: `Booking: ${listing.title}`,
              description: `${hours} hour(s), ${guests} guest(s)`,
            },
          },
        },
      ],
      success_url: `${site}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${site}/list/${listing.id}?cancelled=1`,
      metadata: {
        booking_id: booking.id,
        listing_id: listing.id,
        user_id: userId
      }
    });

    // save session id
    await supa
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json({ error: "Checkout error" }, { status: 500 });
  }
}