// app/listing/ListingBrowseClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// If you already have these components, great; otherwise this still renders without them.
import BrowseFilters from "@/components/BrowseFilters";
import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 12;

export default function ListingBrowseClient() {
  const params = useSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Read URL state
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const q = (params.get("q") || "").trim();
  const category = params.get("category") || "";

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const filters = useMemo(
    () => ({ q, category, page }),
    [q, category, page]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      try {
        let query = supabase
          .from("listings")
          .select("id,title,city,price_cents,cover_url,amenities", { count: "exact" })
          .range(from, to)
          .order("created_at", { ascending: false });

        if (q) {
          // simple search: title/description/City if you have those columns
          query = query.ilike("title", `%${q}%`);
        }
        if (category) {
          query = query.eq("category", category);
        }

        const { data, count: total, error } = await query;
        if (error) throw error;

        if (!cancelled) {
          setRows(data || []);
          setCount(total || 0);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load listings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [from, to, q, category]);

  const onPageChange = (nextPage) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(nextPage));
    router.replace(`/listing?${next.toString()}`);
  };

  return (
    <div className="mt-6">
      {/* Optional filters bar */}
      <BrowseFilters />

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
      {loading && <p className="mt-4 text-gray-600">Loading…</p>}

      {!loading && rows.length === 0 && (
        <p className="mt-6 text-gray-600">No listings found.</p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            city={l.city}
            priceCents={l.price_cents}
            coverUrl={l.cover_url}
            amenities={l.amenities}
          />
        ))}
      </div>

      {count > PAGE_SIZE && (
        <div className="mt-10">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={count}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}