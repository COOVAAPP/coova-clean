// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Haversine (km) with Postgres trigs (no PostGIS required)
function distanceSql(lat, lng) {
  // l.lat/l.lng are in degrees
  return `
    (6371 * acos(
      cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng}))
      + sin(radians(${lat})) * sin(radians(lat))
    ))
  `;
}

export async function GET(req) {
  try {
    const supabase = sb();
    const { searchParams } = new URL(req.url);

    // query params
    const q         = searchParams.get("q") || "";
    const category  = searchParams.get("category") || "All";
    const city      = searchParams.get("city") || "";
    const minPrice  = searchParams.get("minPrice");
    const maxPrice  = searchParams.get("maxPrice");
    const minCap    = searchParams.get("minCap");
    const sort      = searchParams.get("sort") || "newest"; // newest | price_asc | price_desc | distance_asc | distance_desc
    const amenities = (searchParams.get("amenities") || "")
                        .split(",").map(s => s.trim()).filter(Boolean);
    const page      = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit     = Math.min(50, parseInt(searchParams.get("limit") || "12", 10));

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const hasCoords = lat && lng && !Number.isNaN(+lat) && !Number.isNaN(+lng);

    const offset = (page - 1) * limit;

    // Base: only active/public listings
    // NOTE: adjust column names if yours differ (image_url/cover_url/etc.)
    let query = supabase
      .from("listings")
      .select(`
        id,
        title,
        city,
        price_per_hour,
        image_url,
        listing_cover_url
        ${hasCoords ? `, ${distanceSql(+lat, +lng)} as distance_km` : ""}
      `, { count: "exact" })
      .eq("is_public", true);

    // Filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (minPrice) {
      query = query.gte("price_per_hour", Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price_per_hour", Number(maxPrice));
    }

    if (minCap) {
      query = query.gte("capacity", Number(minCap));
    }

    if (amenities.length) {
      // assumes jsonb/text[] contains — tweak for your type if needed
      // jsonb:  query.contains('amenities', '["Wifi","Parking"]')
      // text[]: query.contains('amenities', ['Wifi','Parking'])
      query = query.contains("amenities", amenities);
    }

    // Sorting
    if (sort === "price_asc") query = query.order("price_per_hour", { ascending: true, nullsFirst: false });
    else if (sort === "price_desc") query = query.order("price_per_hour", { ascending: false, nullsFirst: false });
    else if ((sort === "distance_asc" || sort === "distance_desc") && hasCoords) {
      // When sorting by distance, prefer rows that have lat/lng
      // We sort by computed column; use order with a raw SQL hint via column alias
      query = query
        .is("lat", null)   // we will add NULLS LAST by filtering at the end
        .select(undefined); // noop to keep chaining happy
      // supabase-js can't order by alias with direction easily; run two orders:
      // 1) rows where lat is not null first
      query = query.order("lat", { ascending: false, nullsFirst: false });
      // 2) then distance
      query = query.order(hasCoords ? "distance_km" : "created_at", { ascending: sort === "distance_asc" });
    } else {
      // newest
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // If sorting by distance but some rows had null lat/lng, push them to the end with null distance
    let items = data || [];
    if (hasCoords && (sort === "distance_asc" || sort === "distance_desc")) {
      items = items
        .map(r => ({ ...r, distance_km: typeof r.distance_km === "number" ? r.distance_km : null }))
        .sort((a, b) => {
          if (a.distance_km == null && b.distance_km == null) return 0;
          if (a.distance_km == null) return 1;
          if (b.distance_km == null) return -1;
          return sort === "distance_asc" ? a.distance_km - b.distance_km : b.distance_km - a.distance_km;
        });
    }

    return NextResponse.json({
      page,
      limit,
      total: count ?? 0,
      hasMore: (offset + items.length) < (count ?? 0),
      items,
    });
  } catch (err) {
    console.error("[Browse API]", err);
    return NextResponse.json({ error: err.message || "Browse failed" }, { status: 400 });
  }
}