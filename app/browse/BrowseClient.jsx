// app/browse/BrowseClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// If your client is in a different path, update this import:
import { supabase } from "../lib/supabaseClient";

/**
 * Super defensive browser-only list view.
 * - Fetches only fields we know exist in your schema.
 * - Uses <img> (not next/image) so you don’t need images.domains config.
 * - Computes a cover from `image_url` or first of `image_urls`.
 */

function coverFrom(l) {
  // image_url takes precedence
  if (l?.image_url) return l.image_url;

  // image_urls can be jsonb array (already parsed by supabase-js) OR stringified JSON.
  const arr =
    Array.isArray(l?.image_urls)
      ? l.image_urls
      : typeof l?.image_urls === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(l.image_urls);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];

  return arr.find((x) => typeof x === "string" && x.length > 0) || null;
}

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

        // Only select columns we know you have.
        const { data, error } = await supabase
          .from("listings")
          .select(
            // id + a few safe fields (adjust if you rename)
            "id, title, price_per_hour, city, image_url, image_urls, status, is_public"
          )
          // keep it simple; show everything for now
          .order("id", { ascending: false })
          .limit(60);

        if (error) throw error;
        if (!alive) return;

        const normalized =
          (data || []).map((l) => ({
            id: l.id,
            title: l.title || "Untitled",
            city: l.city || "",
            price_per_hour: l.price_per_hour ?? null,
            cover: coverFrom(l),
          })) ?? [];

        setRows(normalized);
      } catch (e) {
        setErr(e?.message || "Failed to load listings.");
        setRows([]);
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
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {err}
      </div>
    );
  }

  if (!rows.length) {
    return <p className="text-gray-600">No listings yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((l) => (
        <Link
          key={l.id}
          href={`/listing/${l.id}`}
          className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
        >
          <div className="relative aspect-[4/3] w-full bg-gray-100">
            {l.cover ? (
              // Using <img> to avoid next/image domain config issues
              <img
                src={l.cover}
                alt={l.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No photo
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="line-clamp-1 text-sm font-semibold">{l.title}</p>
            {l.city ? (
              <p className="mt-1 text-xs text-gray-500">{l.city}</p>
            ) : null}
            <p className="mt-2 text-sm font-bold">
              {typeof l.price_per_hour === "number"
                ? `$${Number(l.price_per_hour).toLocaleString()}`
                : "—"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}