import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q    = (searchParams.get("q") || "").trim();
  const min  = Number(searchParams.get("min") || 0);
  const max  = Number(searchParams.get("max") || 9999999);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const size = Math.min(24, Math.max(1, Number(searchParams.get("size") || 12)));

  const from = (page - 1) * size;
  const to   = from + size - 1;

  let query = supabase
    .from("listings")
    .select("id,title,price,image_url", { count: "exact" })
    .eq("is_public", true)
    .gte("price", min)
    .lte("price", max)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    page,
    size,
    total: count ?? 0,
    pages: Math.max(1, Math.ceil((count ?? 0) / size)),
  });
}