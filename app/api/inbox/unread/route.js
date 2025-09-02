import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid || authErr) return NextResponse.json({ count: 0 });

  // Prefer RPC if you created the function above:
  const { data, error } = await supabase.rpc("get_unread_total", { p_user_id: uid });
  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: data ?? 0 });
}