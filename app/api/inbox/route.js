// app/api/inbox/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Build a server-side Supabase client (no session persistence needed)
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getClient();

  // 1) Who am I?
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  const uid = user?.id;
  if (!uid || authErr) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  // 2) Fetch the conversations the user participates in (newest first)
  const { data: convs, error: convErr } = await supabase
    .from("conversations")
    .select(
      `
        id,
        listing_id,
        user_a,
        user_b,
        created_at
      `
    )
    .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    .order("created_at", { ascending: false });

  if (convErr) {
    return NextResponse.json({ error: convErr.message }, { status: 500 });
  }

  // 3) Ensure a conversation_reads row exists for the user in each convo (no-op if present)
  await Promise.all(
    (convs ?? []).map((c) =>
      supabase
        .from("conversation_reads")
        .upsert(
          {
            conversation_id: c.id,
            user_id: uid,
          },
          { onConflict: "conversation_id,user_id", ignoreDuplicates: true }
        )
    )
  );

  // 4) Pull unread counts from the view for this user
  const { data: counts, error: countErr } = await supabase
    .from("v_conversation_unread")
    // include user_id in the select for easier debugging; not strictly required
    .select("conversation_id, user_id, unread_count")
    .eq("user_id", uid);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  // 5) Build a quick lookup: conversation_id -> unread_count
  const unreadByConv = new Map<string, number>(
    (counts ?? []).map((r: any) => [r.conversation_id, r.unread_count])
  );

  // 6) Shape the payload
  const items = (convs ?? []).map((c: any) => ({
    id: c.id,
    listing_id: c.listing_id,
    user_a: c.user_a,
    user_b: c.user_b,
    created_at: c.created_at,
    unread_count: unreadByConv.get(c.id) ?? 0,
  }));

  return NextResponse.json({ items });
}