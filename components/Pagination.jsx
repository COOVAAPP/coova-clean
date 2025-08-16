"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ page, perPage, total }) {
  const router = useRouter();
  const params = useSearchParams();

  const lastPage = Math.max(1, Math.ceil((total || 0) / perPage));
  const current = Math.min(Math.max(1, page), lastPage);

  const go = (p) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`/browse?${sp.toString()}`);
  };

  if (lastPage <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => go(Math.max(1, current - 1))}
        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
      >
        Prev
      </button>
      <span className="px-3 py-1 text-sm text-gray-700">
        Page <strong>{current}</strong> of <strong>{lastPage}</strong>
      </span>
      <button
        onClick={() => go(Math.min(lastPage, current + 1))}
        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
}