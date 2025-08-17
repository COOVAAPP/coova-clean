"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";

export default function BrowsePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // read current filters from URL
  const q    = sp.get("q")   || "";
  const min  = sp.get("min") || "";
  const max  = sp.get("max") || "";
  const page = Number(sp.get("page") || 1);

  const size = 12;

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (q)   p.set("q", q);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    p.set("page", page.toString());
    p.set("size", size.toString());
    return `/api/listings?${p.toString()}`;
  }, [q, min, max, page]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then((res) => {
        if (!active) return;
        if (res.error) throw new Error(res.error);
        setItems(res.items || []);
        setTotal(res.total || 0);
        setPages(res.pages || 1);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [url]);

  function applyFilters(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nq = (fd.get("q") || "").toString();
    const nmin = (fd.get("min") || "").toString();
    const nmax = (fd.get("max") || "").toString();
    const p = new URLSearchParams();
    if (nq)   p.set("q", nq);
    if (nmin) p.set("min", nmin);
    if (nmax) p.set("max", nmax);
    p.set("page", "1");
    router.push(`/browse?${p.toString()}`);
  }

  function go(pn) {
    const p = new URLSearchParams(sp.toString());
    p.set("page", String(pn));
    router.push(`/browse?${p.toString()}`);
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-bold mb-6">Browse listings</h1>

      {/* Filters */}
      <form onSubmit={applyFilters} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title…"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          name="min"
          defaultValue={min}
          type="number"
          placeholder="Min price"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <input
          name="max"
          defaultValue={max}
          type="number"
          placeholder="Max price"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="btn primary"
        >
          Apply
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ListingCard key={it.id} listing={it} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex items-center gap-2">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => go(page - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {pages} • {total} results
          </span>
          <button
            className="btn"
            disabled={page >= pages}
            onClick={() => go(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}