// components/SearchBar.jsx
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function SearchBar() {
  const params = useSearchParams();

  // Example: read current values safely
  const query = useMemo(() => params.get("q") || "", [params]);

  return (
    <form action="/browse" className="mt-5 grid max-w-2xl grid-cols-12 gap-2 rounded-full bg-white/95 p-2 shadow-lg backdrop-blur">
      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder="I want… (Pools, Cars, Studio)"
        className="col-span-9 rounded-full px-4 py-2 text-[15px] outline-none"
      />
      <button className="col-span-3 rounded-full bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
        Search
      </button>
    </form>
  );
}