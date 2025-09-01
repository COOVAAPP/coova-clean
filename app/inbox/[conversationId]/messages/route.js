// app/api/inbox/[conversationId]/messages/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET ?cursor=<iso>&limit=50  (newest first; pass cursor to page older)
export async function GET(req, ctx) {
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

  // must be participant
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", convId)
    .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const cursor = searchParams.get("cursor"); // ISO date to page older

  let query = supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, attachment_url, created_at")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);

  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: rows ?? [],
    nextCursor: rows?.length ? rows[rows.length - 1].created_at : null,
  });
}

// POST { content?: string, attachment_url?: string }
export async function POST(req, ctx) {
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
  const body = await req.json().catch(() => ({}));
  const content = (body.content || "").trim();
  const attachment_url = body.attachment_url || null;

  if (!content && !attachment_url) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }

  // must be participant
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", convId)
    .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: convId,
      sender_id: uid,
      content: content || null,
      attachment_url,
    })
    .select("id, conversation_id, sender_id, content, attachment_url, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ item: data });
}