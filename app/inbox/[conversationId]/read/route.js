// app/api/inbox/[conversationId]/read/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(_req, { params }) {
  const supabase = getClient();

  // who am I?
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid || authErr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convId = params?.conversationId;
  if (!convId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  // (Optional) ensure requester is part of this conversation
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", convId)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conv.user_a !== uid && conv.user_b !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Upsert read state
  const now = new Date().toISOString();
  const { error: upErr } = await supabase
    .from("conversation_reads")
    .upsert(
      { conversation_id: convId, user_id: uid, last_read_at: now },
      { onConflict: "conversation_id,user_id" }
    );

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, last_read_at: now });
}