// app/browse/BrowseClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function BrowseClient() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      setErr("");
      // Only columns that exist in your table
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,image_url,price_per_hour")
        .order("created_at", { ascending: false })
        .limit(30);

      if (!alive) return;
      if (error) {
        setErr(error.message || "Failed to load listings.");
      } else {
        setRows(data || []);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-cyan-500">Browse</h1>

      {err && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/listing/${r.id}`}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
          >
            <div className="relative aspect-[4/3] w-full bg-gray-50">
              {r.image_url ? (
                <img
                  src={r.image_url}
                  alt={r.title || "Listing"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No photo
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold">{r.title || "Listing"}</p>
              <p className="mt-2 text-sm font-bold">
                ${Number(r.price_per_hour ?? 0).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {rows.length === 0 && !err && (
        <p className="mt-6 text-sm text-gray-500">No listings yet.</p>
      )}
    </div>
  );
}