// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// If your DB stores price in *cents*, set this to true.
const PRICE_IS_CENTS = false; // <— flip to true if you use integer cents

function toNumber(v, def = undefined) {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET(req) {
  const url = new URL(req.url);
  const q         = url.searchParams.get("q") ?? "";
  const category  = url.searchParams.get("category") ?? "";
  const city      = url.searchParams.get("city") ?? "";
  const minPrice  = toNumber(url.searchParams.get("minPrice"));
  const maxPrice  = toNumber(url.searchParams.get("maxPrice"));
  const minCap    = toNumber(url.searchParams.get("minCap"));
  const maxCap    = toNumber(url.searchParams.get("maxCap"));
  const sort      = url.searchParams.get("sort") ?? "newest";
  const page      = Math.max(1, toNumber(url.searchParams.get("page"), 1));
  const limit     = Math.min(50, Math.max(1, toNumber(url.searchParams.get("limit"), 12)));
  const amenities = (url.searchParams.get("amenities") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // Base query
  let query = supabase
    .from("listings")
    .select(
      `
      id,
      title,
      cover_url,
      image_url,
      image_urls,
      category,
      city,
      capacity,
      price_per_hour,
      created_at
    `,
      { count: "exact" }
    )
    // Only public/active listings; adjust to your schema
    .eq("status", "active");

  // Text search (simple ILIKE on title/description)
  if (q) {
    query = query.or(
      `title.ilike.%${q.replaceAll(".", "\\.").replaceAll("-", "\\-")}%,description.ilike.%${q}%`
    );
  }

  // Filters
  if (category && category !== "All") query = query.eq("category", category);
  if (city) query = query.ilike("city", `%${city}%`);
  if (minCap !== undefined) query = query.gte("capacity", minCap);
  if (maxCap !== undefined) query = query.lte("capacity", maxCap);

  // Price filtering
  if (minPrice !== undefined) {
    query = PRICE_IS_CENTS
      ? query.gte("price_per_hour", Math.round(minPrice * 100))
      : query.gte("price_per_hour", minPrice);
  }
  if (maxPrice !== undefined) {
    query = PRICE_IS_CENTS
      ? query.lte("price_per_hour", Math.round(maxPrice * 100))
      : query.lte("price_per_hour", maxPrice);
  }

  // Amenity filter (assumes `amenities` is text[] or jsonb array)
  // For text[]: .contains('amenities', ['Wifi','Parking'])
  // For jsonb:  .contains('amenities', ['Wifi','Parking']) also works if it's a plain array of strings.
  if (amenities.length) {
    query = query.contains("amenities", amenities);
  }

  // Sorting
  if (sort === "price_asc")   query = query.order("price_per_hour", { ascending: true, nullsFirst: false });
  else if (sort === "price_desc") query = query.order("price_per_hour", { ascending: false, nullsFirst: false });
  else /* newest */            query = query.order("created_at", { ascending: false, nullsFirst: false });

  // Pagination
  const from = (page - 1) * limit;
  const to   = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Normalize image field for cards (cover_url fallback)
  const items = (data || []).map((r) => ({
    ...r,
    cover_url: r.cover_url || r.image_url || (Array.isArray(r.image_urls) ? r.image_urls[0] : null),
  }));

  const total = count ?? items.length;
  const hasMore = to + 1 < total;

  return NextResponse.json({ items, page, limit, total, hasMore });
}