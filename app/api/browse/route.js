// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

function cleanNumber(value, def = null) {
  if (value === null || value === undefined || value === "") return def;
  const n = Number(value);
  return Number.isFinite(n) ? n : def;
}

export async function GET(req) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(req.url);

    // params
    const q         = searchParams.get("q") || "";
    const category  = searchParams.get("category") || "";
    const city      = searchParams.get("city") || "";
    const minPrice  = cleanNumber(searchParams.get("minPrice"));
    const maxPrice  = cleanNumber(searchParams.get("maxPrice"));
    const minCap    = cleanNumber(searchParams.get("minCap"));
    const amenities = (searchParams.get("amenities") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sort = searchParams.get("sort") || "newest"; // newest | price_asc | price_desc

    const page  = Math.max(1, cleanNumber(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, cleanNumber(searchParams.get("limit"), 12)));
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    // helper to apply all filters consistently
    const applyFilters = (qBuilder) => {
      // visibility
      qBuilder = qBuilder.eq("status", "active");

      if (q) {
        // Match title OR description (case-insensitive)
        // PostgREST: or(`ilike.title.%${q}%,ilike.description.%${q}%`)
        qBuilder = qBuilder.or(
          `ilike.title.%${q}%,ilike.description.%${q}%`
        );
      }
      if (category) qBuilder = qBuilder.eq("category", category);
      if (city)     qBuilder = qBuilder.ilike("city", `%${city}%`);
      if (minPrice !== null) qBuilder = qBuilder.gte("price_per_hour", minPrice);
      if (maxPrice !== null) qBuilder = qBuilder.lte("price_per_hour", maxPrice);
      if (minCap   !== null) qBuilder = qBuilder.gte("capacity", minCap);

      // amenities: require ALL selected amenities to be present
      // Works for jsonb [] with .contains([...]) and for text[] in most setups
      if (amenities.length > 0) {
        qBuilder = qBuilder.contains("amenities", amenities);
        // If your column is TEXT[] and .contains doesn't work, try:
        // qBuilder = qBuilder.overlaps("amenities", amenities); // matches ANY
      }

      // sorting
      if (sort === "price_asc")  qBuilder = qBuilder.order("price_per_hour", { ascending: true, nullsFirst: false });
      else if (sort === "price_desc") qBuilder = qBuilder.order("price_per_hour", { ascending: false, nullsFirst: false });
      else qBuilder = qBuilder.order("created_at", { ascending: false });

      return qBuilder;
    };

    // 1) count
    const countQuery = applyFilters(
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
    );
    const { count, error: countErr } = await countQuery;
    if (countErr) throw countErr;

    // 2) page data
    const selectQuery = applyFilters(
      supabase
        .from("listings")
        .select(
          `
          id,
          title,
          cover_url,
          images,
          price_per_hour,
          city,
          category,
          capacity,
          amenities
        `
        )
        .range(from, to)
    );
    const { data: items, error: dataErr } = await selectQuery;
    if (dataErr) throw dataErr;

    const hasMore = to + 1 < (count ?? 0);

    return NextResponse.json({
      page,
      pageSize: limit,
      total: count ?? 0,
      hasMore,
      items: items ?? [],
    });
  } catch (e) {
    console.error("/api/browse GET error:", e);
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}