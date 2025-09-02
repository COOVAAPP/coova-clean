// app/api/inbox/unread-count/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service for RLS-safe count
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ unread: 0 }, { status: 200 });
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Verify user from the JWT
    const svc = getServiceClient();
    const { data: userInfo, error: verErr } = await svc.auth.getUser(jwt);
    if (verErr || !userInfo?.user?.id) {
      return NextResponse.json({ unread: 0 }, { status: 200 });
    }
    const userId = userInfo.user.id;

    // Count unread messages for this user
    // covers both roles; adjust to your schema if needed
    const { data, error } = await svc.rpc("get_unread_count", {
      p_user_id: userId,
    });
    if (error) throw error;

    return NextResponse.json({ unread: data ?? 0 });
  } catch (e) {
    console.error("/api/inbox/unread-count", e);
    return NextResponse.json({ unread: 0 }, { status: 200 });
  }
}