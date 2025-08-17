import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(req) {
  const supa = serverClient();
  const sig = req.headers.get("stripe-signature");
  const buf = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const booking_id = session?.metadata?.booking_id;
      if (booking_id) {
        await supa.from("bookings")
          .update({ status: "paid" })
          .eq("id", booking_id);
      }
    }
  } catch (e) {
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false } // ensure raw body
};