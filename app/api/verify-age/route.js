import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Helper: calc age in years (server-side)
function ageFromDOB(dobStr) {
  const dob = new Date(dobStr + "T00:00:00Z");
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

export async function POST(req) {
  try {
    const { date_of_birth, attest } = await req.json();

    const { data: { session }, error: sErr } = await supabase.auth.getSession();
    if (sErr || !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!date_of_birth || !attest) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const age = ageFromDOB(date_of_birth);
    if (age < 18) {
      return NextResponse.json({ error: "You must be 18 or older." }, { status: 403 });
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        date_of_birth,
        verified_18: true,
        verified_at: new Date().toISOString(),
        verification_method: "dob_attestation"
      });

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}