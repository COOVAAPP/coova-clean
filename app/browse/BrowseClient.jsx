// app/browse/BrowseClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function BrowseClient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // Fetch a lightweight set of fields that match your schema
        const { data, error } = await supabase
          .from("listings")
          .select(
            "id,title,city,price_per_hour,cover_url,image_url,image_urls"
          )
          .eq("status", "active")        // change/remove if you use a different status field
          .order("created_at", { ascending: false })
          .limit(24);

        if (error) throw error;
        if (!alive) return;
        setRows(data ?? []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load listings.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading…</p>;
  }
  if (err) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {err}
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="text-gray-600">No listings yet. Try again later.</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((l) => {
        // Pick a cover image from your possible fields
        const cover =
          l.cover_url ||
          l.image_url ||
          (Array.isArray(l.image_urls) ? l.image_urls[0] : null);

        return (
          <Link
            key={l.id}
            href={`/listing/${l.id}`}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
          >
            <div className="relative aspect-[4/3] w-full bg-gray-50">
              {cover ? (
                <Image
                  src={cover}
                  alt={l.title || "Listing"}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No photo
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold">
                {l.title || "Listing"}
              </p>
              <p className="mt-1 text-xs text-gray-500">{l.city || ""}</p>
              <p className="mt-2 text-sm font-bold">
                ${Number(l.price_per_hour ?? 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">/ hour</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}