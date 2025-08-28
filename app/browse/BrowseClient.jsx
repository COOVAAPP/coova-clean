// app/browse/BrowseClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";

const CATEGORIES = ["All", "Studio", "Event Space", "Outdoor", "Kitchen", "Office", "Gallery", "Other"];
const AMENITY_SUGGESTIONS = ["Wifi", "Parking", "A/C", "Heat", "Power", "Restroom", "Lighting", "Sound System", "Kitchen", "Changing Room"];

function useQueryState() {
  const router = useRouter();
  const sp = useSearchParams();

  const state = useMemo(() => {
    const get = (k, d = "") => sp.get(k) ?? d;
    const getNum = (k) => {
      const v = sp.get(k);
      if (v === null) return "";
      const n = Number(v);
      return Number.isFinite(n) ? String(n) : "";
    };
    const amenities = (sp.get("amenities") || "").split(",").map((x) => x.trim()).filter(Boolean);

    return {
      q: get("q"),
      category: get("category", "All"),
      city: get("city"),
      minPrice: getNum("minPrice"),
      maxPrice: getNum("maxPrice"),
      minCap: getNum("minCap"),
      sort: get("sort", "newest"),
      amenities,
      page: Number(sp.get("page") || "1"),
    };
  }, [sp]);

  const set = (patch, resetPage = true) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
        params.delete(k);
      } else {
        params.set(k, Array.isArray(v) ? v.join(",") : String(v));
      }
    });
    if (resetPage) params.delete("page");
    router.replace(`/browse?${params.toString()}`);
  };

  return [state, set];
}

export default function BrowseClient() {
  const [qs, setQs] = useQueryState();

  // local UI state (mirrors qs)
  const [q, setQ] = useState(qs.q);
  const [category, setCategory] = useState(qs.category);
  const [city, setCity] = useState(qs.city);
  const [minPrice, setMinPrice] = useState(qs.minPrice);
  const [maxPrice, setMaxPrice] = useState(qs.maxPrice);
  const [minCap, setMinCap] = useState(qs.minCap);
  const [sort, setSort] = useState(qs.sort);
  const [amenities, setAmenities] = useState(qs.amenities);

  // results
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(qs.page || 1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // sync when URL changes (back/forward, external nav)
  useEffect(() => {
    setQ(qs.q);
    setCategory(qs.category);
    setCity(qs.city);
    setMinPrice(qs.minPrice);
    setMaxPrice(qs.maxPrice);
    setMinCap(qs.minCap);
    setSort(qs.sort);
    setAmenities(qs.amenities);
    setPage(qs.page || 1);
  }, [qs]);

  // fetch
  async function fetchPage(p = 1, append = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category && category !== "All") params.set("category", category);
      if (city) params.set("city", city);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minCap) params.set("minCap", minCap);
      if (sort) params.set("sort", sort);
      if (amenities?.length) params.set("amenities", amenities.join(","));
      params.set("page", String(p));
      params.set("limit", "12");

      const res = await fetch(`/api/browse?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch");

      setHasMore(json.hasMore);
      setPage(json.page);
      setItems((prev) => (append ? [...prev, ...json.items] : json.items));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // refetch when URL-backed params change
  useEffect(() => {
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs.q, qs.category, qs.city, qs.minPrice, qs.maxPrice, qs.minCap, qs.sort, qs.amenities]);

  // actions
  const submitFilters = (e) => {
    e?.preventDefault?.();
    setQs(
      {
        q,
        category,
        city,
        minPrice,
        maxPrice,
        minCap,
        sort,
        amenities,
      },
      true // reset page to 1
    );
  };

  const toggleAmenity = (name) => {
    setAmenities((a) => (a.includes(name) ? a.filter((x) => x !== name) : [...a, name]));
  };

  return (
    <div className="container-page">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Browse spaces</h1>

      {/* Filters */}
      <form onSubmit={submitFilters} className="mt-5 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-12">
          {/* Query */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-600">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title or description"
              className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Category */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Atlanta"
              className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Capacity */}
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-600">Min capacity</label>
            <input
              type="number"
              min={1}
              value={minCap}
              onChange={(e) => setMinCap(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Price range */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600">Price min</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-[9px] text-gray-400">$</span>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 pl-5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600">Price max</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-[9px] text-gray-400">$</span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 pl-5 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_SUGGESTIONS.map((a) => {
              const active = amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full px-3 py-1 text-xs border transition ${
                    active
                      ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-cyan-300"
                  }`}
                >
                  {active ? "✓ " : "+ "}{a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategory("All");
              setCity("");
              setMinPrice("");
              setMaxPrice("");
              setMinCap("");
              setSort("newest");
              setAmenities([]);
              setQs({}, true); // clear URL
            }}
            className="rounded-md border px-4 py-1.5 text-sm font-semibold hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Apply filters
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="mt-6">
        {loading && items.length === 0 ? (
          <p className="text-gray-500">Searching…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No results. Try relaxing filters.</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => fetchPage(page + 1, true)}
                  className="rounded-full border px-5 py-2 font-semibold hover:bg-gray-50"
                  disabled={loading}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}