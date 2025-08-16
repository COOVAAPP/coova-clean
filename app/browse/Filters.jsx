"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [minPrice, setMinPrice] = useState(params.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") || "");
  const [sort, setSort] = useState(params.get("sort") || "new");

  useEffect(() => {
    setQ(params.get("q") || "");
    setCategory(params.get("category") || "");
    setMinPrice(params.get("min") || "");
    setMaxPrice(params.get("max") || "");
    setSort(params.get("sort") || "new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const submit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    if (minPrice) sp.set("min", minPrice);
    if (maxPrice) sp.set("max", maxPrice);
    if (sort) sp.set("sort", sort);
    sp.set("page", "1");
    router.push(`/browse?${sp.toString()}`);
  };

  return (
    <form onSubmit={submit} className="w-full grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        className="col-span-2 w-full rounded border border-gray-300 px-3 py-2"
        placeholder="Search title…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="w-full rounded border border-gray-300 px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="Pools">Pools</option>
        <option value="Venues">Venues</option>
        <option value="Cars">Cars</option>
        <option value="Studios">Studios</option>
      </select>
      <input
        className="w-full rounded border border-gray-300 px-3 py-2"
        placeholder="Min $"
        type="number"
        min="0"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />
      <input
        className="w-full rounded border border-gray-300 px-3 py-2"
        placeholder="Max $"
        type="number"
        min="0"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <select
        className="w-full rounded border border-gray-300 px-3 py-2"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="new">Newest</option>
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
      </select>
      <button
        type="submit"
        className="md:col-span-6 w-full rounded bg-brand-600 text-white font-medium py-2 hover:bg-brand-700"
      >
        Apply Filters
      </button>
    </form>
  );
}