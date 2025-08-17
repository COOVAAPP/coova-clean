"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BrowseFilters from "@/components/BrowseFilters";
import ListingCard from "@/components/ListingCard";

const PAGE_SIZE = 9;

export default function BrowsePage() {
  const sp = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const q = (sp.get("q") || "").trim();
  const loc = (sp.get("loc") || "").trim();
  const type = (sp.get("type") || "all").trim();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  const rangeStart = (page - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;

  const filterSummary = useMemo(() => {
    const parts = [];
    if (type !== "all") parts.push(type);
    if (q) parts.push(`“${q}”`);
    if (loc) parts.push(loc);
    return parts.length ? parts.join(" · ") : "All listings";
  }, [type, q, loc]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);

      let query = supabase
        .from("listings")
        .select("*", { count: "exact" })
        .eq("is_public", true);

      if (type !== "all") {
        query = query.eq("type", type);
      }
      if (q) {
        // search in title or description
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }
      if (loc) {
        // search in city or state
        query = query.or(`city.ilike.%${loc}%,state.ilike.%${loc}%`);
      }

      // newest first + pagination
      query = query.order("created_at", { ascending: false }).range(rangeStart, rangeEnd);

      const { data, error, count } = await query;

      if (error) {
        console.error(error);
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setItems(data || []);
        setTotal(count ?? 0);
        setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [page, q, loc, type, rangeStart, rangeEnd]);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  function goTo(newPage) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(newPage));
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Browse</h1>
      <p className="mt-1 text-sm text-gray-600">{filterSummary}</p>

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <BrowseFilters />
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Loading listings…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            No listings match your filters.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <ListingCard key={it.id} listing={it} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => goTo(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          ← Prev
        </button>
        <div className="text-sm text-gray-700">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
        <button
          onClick={() => goTo(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Next →
        </button>
      </div>
    </main>
  );
}