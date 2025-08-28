// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Haversine distance in KM
function distanceKm(a, b) {
  if (
    a == null ||
    b == null ||
    a.lat == null ||
    a.lng == null ||
    b.lat == null ||
    b.lng == null
  )
    return null;

  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const h =
    sin1 * sin1 + Math.cos(la1) * Math.cos(la2) * sin2 * sin2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export async function GET(req) {
  try {
    const supabase = getClient();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const minPrice = Number(searchParams.get("minPrice") || "");
    const maxPrice = Number(searchParams.get("maxPrice") || "");
    const minCap = Number(searchParams.get("minCap") || "");
    const sort = searchParams.get("sort") || "newest";
    const amenities = (searchParams.get("amenities") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));
    const lat = Number(searchParams.get("lat") || "");
    const lng = Number(searchParams.get("lng") || "");

    // Base query (pull enough fields for filters & card)
    let query = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        city,
        category,
        capacity,
        price_per_hour,
        cover_url,
        image_url,
        image_urls,
        lat,
        lng,
        created_at
      `
      );

    // Text search (very simple ILIKE on title/description)
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (city) {
      query = query.ilike("city", `%${city}%`);
    }
    if (Number.isFinite(minCap) && minCap > 0) {
      query = query.gte("capacity", minCap);
    }
    if (Number.isFinite(minPrice) && minPrice >= 0) {
      query = query.gte("price_per_hour", minPrice);
    }
    if (Number.isFinite(maxPrice) && maxPrice >= 0) {
      query = query.lte("price_per_hour", maxPrice);
    }

    if (amenities.length) {
      // assumes amenities is jsonb array; adjust if text[]
      // require ALL amenities:
      amenities.forEach((a) => {
        query = query.contains("amenities", [a]);
      });
    }

    // We’ll pull a window bigger than one page if sorting by distance (so we can sort in JS),
    // otherwise we can paginate directly in SQL.
    const sortByDistance = sort === "distance_asc" || sort === "distance_desc";

    if (!sortByDistance) {
      if (sort === "price_asc") query = query.order("price_per_hour", { ascending: true });
      else if (sort === "price_desc") query = query.order("price_per_hour", { ascending: false });
      else query = query.order("created_at", { ascending: false }); // newest
      query = query.range((page - 1) * limit, page * limit - 1);
    } else {
      // pull more rows, sort in JS, then slice
      query = query.limit(limit * 5); // heuristic window
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    let results = rows || [];

    // compute distance & sort if requested
    if (sortByDistance && Number.isFinite(lat) && Number.isFinite(lng)) {
      const origin = { lat, lng };
      results = results.map((r) => ({
        ...r,
        distance_km:
          Number.isFinite(r?.lat) && Number.isFinite(r?.lng)
            ? distanceKm(origin, { lat: r.lat, lng: r.lng })
            : null,
      }));

      results.sort((a, b) => {
        // listings with known distance first
        const da = a.distance_km ?? Number.POSITIVE_INFINITY;
        const db = b.distance_km ?? Number.POSITIVE_INFINITY;
        return sort === "distance_asc" ? da - db : db - da;
      });

      // now slice for pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const pageItems = results.slice(start, end);
      return NextResponse.json({
        page,
        hasMore: end < results.length,
        items: pageItems,
      });
    }

    // normal (non-distance) path →
    // if we didn’t fetch total count, we can approximate hasMore by page size
    const hasMore = results.length === limit;
    return NextResponse.json({ page, hasMore, items: results });
  } catch (err) {
    console.error("[/api/browse] error", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}