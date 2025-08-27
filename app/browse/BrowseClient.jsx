// app/browse/BrowseClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function BrowseClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        // Be generous with columns; some may not exist in your DB.
        const { data, error } = await supabase
          .from("listings")
          .select("id,title,description,image_url,image_url,image_urls,price_per_hour,city")
          .order("created_at", { ascending: false })
          .limit(24);

        if (error) {
          console.error("[Browse] Supabase error:", error);
          throw error;
        }

        // Normalize rows safely
        const normalized = (data || []).map((r) => {
          const gallery = Array.isArray(r.image_urls) ? r.image_urls.filter(Boolean) : [];
          const cover =
            r.image_url ||
            r.cover_url ||
            gallery[0] ||
            null;

          return {
            id: r.id,
            title: r.title || "Untitled",
            city: r.city || "",
            price: typeof r.price_per_hour === "number" ? r.price_per_hour : null,
            cover,
          };
        });

        if (alive) setRows(normalized);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load listings.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading…</p>;
  }

  if (err) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {err}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="text-gray-600">No listings yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r) => (
        <Link
          key={r.id}
          href={`/listing/${r.id}`}
          className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
        >
          <div className="relative aspect-[4/3] w-full bg-gray-50">
            {r.cover ? (
              // Use plain <img> to avoid Next image-domain hurdles
              <img
                src={r.cover}
                alt={r.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No photo
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-1 text-sm font-semibold">{r.title}</p>
            <p className="mt-1 text-xs text-gray-500">{r.city}</p>
            {typeof r.price === "number" && (
              <p className="mt-2 text-sm font-bold">${r.price.toLocaleString()}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}