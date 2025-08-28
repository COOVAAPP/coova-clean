// app/api/browse/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Haversine (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null || lon1 == null ||
    lat2 == null || lon2 == null
  ) return null;

  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

export async function GET(req) {
  try {
    const supabase = getClient();

    const { searchParams } = new URL(req.url);

    // Inputs
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const minPrice = Number(searchParams.get("minPrice") || "");
    const maxPrice = Number(searchParams.get("maxPrice") || "");
    const minCap = Number(searchParams.get("minCap") || "");
    const sort = (searchParams.get("sort") || "newest").toLowerCase();
    const amenitiesParam = searchParams.get("amenities") || "";
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "12")));
    const offset = (page - 1) * limit;

    // Build base query
    // (We fetch a little extra, sort/filter in JS for distance/amenities, then paginate.)
    let query = supabase
      .from("listings")
      .select(
        `
        id,
        title,
        description,
        category,
        capacity,
        price_per_hour,
        amenities,
        cover_url,
        image_url,
        city,
        state,
        country,
        lat,
        lng,
        created_at
      `
      );

    // Simple text search: title/description ILIKE
    if (q) {
      // PostgREST doesn't support OR across cols with simple eq; use filter and ilike+logic via or()
      // Here we use .or() to ILIKE multiple columns
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%`
      );
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    if (Number.isFinite(minPrice)) {
      query = query.gte("price_per_hour", minPrice);
    }
    if (Number.isFinite(maxPrice) && maxPrice >= 0) {
      query = query.lte("price_per_hour", maxPrice);
    }

    if (Number.isFinite(minCap) && minCap > 0) {
      query = query.gte("capacity", minCap);
    }

    // Pull a generous chunk; we’ll sort & paginate in memory so distance works.
    // If your table gets large, consider moving distance to SQL (PostGIS) later.
    const { data: rows, error } = await query
      .order("created_at", { ascending: false })
      .limit(500); // cap server-side payload

    if (error) throw error;

    // Amenity filtering (any match)
    const wantedAmenities = amenitiesParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let items = (rows || []).filter((r) => {
      if (wantedAmenities.length === 0) return true;

      const have = Array.isArray(r.amenities)
        ? r.amenities.map((x) => String(x))
        : Array.isArray(r.amenities?.items)
        ? r.amenities.items.map((x) => String(x))
        : [];

      // Keep if any requested amenity is present
      return wantedAmenities.some((a) => have.includes(a));
    });

    // Compute distance if coords present
    if (lat != null && lng != null) {
      items = items.map((r) => ({
        ...r,
        distanceKm: haversineKm(lat, lng, r.lat, r.lng),
      }));
    } else {
      items = items.map((r) => ({ ...r, distanceKm: null }));
    }

    // Sort
    items.sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.price_per_hour ?? 0) - (b.price_per_hour ?? 0);
        case "price_desc":
          return (b.price_per_hour ?? 0) - (a.price_per_hour ?? 0);
        case "distance_asc":
          return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
        case "distance_desc":
          return (b.distanceKm ?? -Infinity) - (a.distanceKm ?? -Infinity);
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    // Paginate (after sort)
    const total = items.length;
    const pageItems = items.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Shape for card
    const payload = pageItems.map((r) => ({
      id: r.id,
      title: r.title,
      city: r.city,
      price_per_hour: r.price_per_hour,
      cover_url: r.cover_url || r.image_url || null,
      distanceKm: r.distanceKm != null ? Number(r.distanceKm.toFixed(1)) : null,
    }));

    return NextResponse.json({
      items: payload,
      page,
      limit,
      hasMore,
      total,
    });
  } catch (e) {
    console.error("/api/browse error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}