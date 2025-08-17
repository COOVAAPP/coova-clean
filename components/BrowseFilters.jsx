"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function BrowseFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [loc, setLoc] = useState(sp.get("loc") || "");
  const [type, setType] = useState(sp.get("type") || "all");

  // keep local state in sync when user navigates
  useEffect(() => {
    setQ(sp.get("q") || "");
    setLoc(sp.get("loc") || "");
    setType(sp.get("type") || "all");
  }, [sp]);

  function applyFilters(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (loc.trim()) params.set("loc", loc.trim());
    if (type !== "all") params.set("type", type);
    params.set("page", "1"); // reset pagination
    router.push(`/browse?${params.toString()}`);
  }

  function clearAll() {
    router.push("/browse?page=1");
  }

  return (
    <form onSubmit={applyFilters} className="grid gap-3 sm:grid-cols-12">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What are you looking for? (pool, car, studio)"
        className="sm:col-span-5 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />
      <input
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        placeholder="Location (city or state)"
        className="sm:col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="sm:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="all">All types</option>
        <option value="pools">Pools & Venues</option>
        <option value="cars">Luxury Cars</option>
        <option value="spaces">Unique Spaces</option>
      </select>
      <div className="sm:col-span-2 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}