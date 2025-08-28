// app/api/geocode/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const line1   = searchParams.get("line1") || "";
    const city    = searchParams.get("city") || "";
    const state   = searchParams.get("state") || "";
    const country = searchParams.get("country") || "";

    const q = [line1, city, state, country].filter(Boolean).join(", ");
    if (!q) return NextResponse.json({ error: "Missing address" }, { status: 400 });

    const token = process.env.MAPBOX_TOKEN;
    if (!token) return NextResponse.json({ error: "Missing MAPBOX_TOKEN" }, { status: 500 });

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      q
    )}.json?access_token=${token}&limit=1&autocomplete=false`;

    const r = await fetch(url, { cache: "no-store" });
    const json = await r.json();

    const f = json?.features?.[0];
    if (!f?.center?.length) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // Mapbox returns [lng, lat]
    const [lng, lat] = f.center;
    return NextResponse.json({
      found: true,
      lat,
      lng,
      place_name: f.place_name,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Geocode failed" }, { status: 500 });
  }
}