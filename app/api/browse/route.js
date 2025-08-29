// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const q         = sp.get("q") || "";
  const category  = sp.get("category") || "";
  const city      = sp.get("city") || "";
  const minPrice  = sp.get("minPrice");
  const maxPrice  = sp.get("maxPrice");
  const minCap    = sp.get("minCap");
  const sort      = sp.get("sort") || "newest";
  const amenities = (sp.get("amenities") || "").split(",").map(s => s.trim()).filter(Boolean);
  const page      = Math.max(1, Number(sp.get("page") || "1"));
  const limit     = Math.min(50, Math.max(1, Number(sp.get("limit") || "12")));
  const latParam  = sp.get("lat");
  const lngParam  = sp.get("lng");

  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;

  const supabase = getClient();

  // Base query from listings
  let query = supabase
    .from("listings")
    .select(`
      id,
      title,
      description,
      category,
      city,
      state,
      country,
      capacity,
      price_per_hour,
      image_url,
      cover_url,
      image_urls,
      lat,
      lng,
      created_at
    `, { count: "exact" })
    .eq("status", "active"); // adjust if you use is_public instead

  // Text search (very simple LIKEs; swap for FTS if you like)
  if (q) {
    query = query.ilike("title", `%${q}%`).ilike("description", `%${q}%`);
  }

  if (category && category !== "All") query = query.eq("category", category);
  if (city) query = query.ilike("city", city);

  if (minCap)   query = query.gte("capacity", Number(minCap));
  if (minPrice) query = query.gte("price_per_hour", Number(minPrice));
  if (maxPrice) query = query.lte("price_per_hour", Number(maxPrice));

  // Amenity contains-all (array/json column). If your column is jsonb array of text:
  if (amenities.length) {
    // requires amenities as jsonb[] of strings; adjust if different
    for (const a of amenities) {
      query = query.contains("amenities", [a]);
    }
  }

  // Pagination
  const from = (page - 1) * limit;
  const to   = from + limit - 1;

  // NOTE: Supabase JS can't compute ST_DistanceSphere in the client query builder directly.
  // We'll do a server-side SQL RPC via `rpc` or use a Postgres view.
  // To keep this file self-contained, we’ll fetch raw rows, then compute distance in JS
  // when lat/lng provided (fallback). If you want DB-side ranking (faster/accurate),
  // use the SQL view approach we created earlier.
  let { data, error, count } = await query.range(from, to).order(
    sort === "price_asc"  ? "price_per_hour" :
    sort === "price_desc" ? "price_per_hour" :
    "created_at",
    { ascending: sort === "price_asc" || sort === "newest" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Fallback distance calculation in JS (Haversine) if lat/lng present
  if (lat != null && lng != null) {
    const R = 6371000; // meters
    const toRad = (d) => (d * Math.PI) / 180;

    data = (data || []).map((row) => {
      if (row.lat == null || row.lng == null) return { ...row, distance_meters: null };
      const dLat = toRad(row.lat - lat);
      const dLng = toRad(row.lng - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(row.lat)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return { ...row, distance_meters: d };
    });

    if (sort === "distance") {
      data.sort((a, b) => {
        const da = a.distance_meters ?? Number.POSITIVE_INFINITY;
        const db = b.distance_meters ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }
  }

  const hasMore = from + (data?.length || 0) < (count || 0);

  // Normalize fields ListingCard expects
  const items = (data || []).map((l) => ({
    id: l.id,
    title: l.title,
    city: l.city,
    price_per_hour: l.price_per_hour,
    listing_cover_url: l.cover_url || l.image_url || (Array.isArray(l.image_urls) ? l.image_urls[0] : null),
    distance_meters: l.distance_meters ?? null,
  }));

  return NextResponse.json({ items, page, hasMore, total: count || 0 });
}