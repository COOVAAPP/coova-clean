// app/api/inbox/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getClient();

  // who am I?
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  const uid = user?.id;
  if (!uid || authErr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // conversations I participate in
  const { data: convs, error: convErr } = await supabase
    .from("conversations")
    .select("id, listing_id, user_a, user_b, created_at")
    .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    .order("created_at", { ascending: false });

  if (convErr) {
    return NextResponse.json({ error: convErr.message }, { status: 500 });
  }

  // unread counts per conversation
  //  - we read last_read_at from conversation_reads (may be null)
  //  - count messages with created_at > last_read_at and sender != me
  const results = await Promise.all(
    (convs ?? []).map(async (c) => {
      const { data: readRow } = await supabase
        .from("conversation_reads")
        .select("last_read_at")
        .eq("conversation_id", c.id)
        .eq("user_id", uid)
        .maybeSingle();

      const lastRead = readRow?.last_read_at ?? null;

      let msgQuery = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", uid);

      if (lastRead) msgQuery = msgQuery.gt("created_at", lastRead);

      const { count = 0 } = await msgQuery;
      return { ...c, unread_count: count || 0 };
    })
  );

  return NextResponse.json({ items: results });
}