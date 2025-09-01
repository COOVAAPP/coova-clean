// app/api/inbox/[conversationId]/read/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(_req, ctx) {
  const supabase = getClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  const uid = user?.id;
  if (!uid || authErr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convId = ctx.params.conversationId;

  // verify participant
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", convId)
    .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("conversation_reads")
    .upsert(
      {
        conversation_id: convId,
        user_id: uid,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id,user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}