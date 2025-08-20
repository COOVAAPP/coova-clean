// app/api/stripe-webhook/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // webhooks usually need service role

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function POST(req) {
  // TODO: verify Stripe signature & process event
  // Example save (placeholder):
  // await supabase.from("events").insert({ type: "stripe", received_at: new Date().toISOString() });
  return new NextResponse("ok", { status: 200 });
}