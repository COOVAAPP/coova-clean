// app/listing/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ListingIndexPage() {
  const router = useRouter();
  const search = useSearchParams();
  const mine = search.get("mine") === "1";

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // load session once
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session || null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess || null);
    });
    return () => sub.subscription?.unsubscribe?.();
  }, []);

  // query listings
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");

      try {
        // if "mine=1", require auth
        if (mine && !session) {
          router.replace(`/login?redirect=${encodeURIComponent("/listing?mine=1")}`);
          return;
        }

        let q = supabase
          .from("listings")
          .select("id, title, price, cover_url, status, is_public, created_at")
          .order("created_at", { ascending: false });

        if (mine) {
          // only my listings
          const userId = session?.user?.id;
          if (!userId) {
            setRows([]);
            setLoading(false);
            return;
          }
          q = q.eq("owner_id", userId);
        } else {
          // public feed only
          q = q.eq("is_public", true);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (!cancelled) setRows(data || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    // re-run when mine/session changes
  }, [mine, session, router]);

  const title = useMemo(() => (mine ? "My Listings" : "All Listings"), [mine]);

  return (
    <main className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link
          href="/list"
          className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Create Listing
        </Link>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <div className="rounded-lg border border-black/10 p-6 text-center">
          <p className="mb-3">
            {mine ? "You don’t have any listings yet." : "No listings available."}
          </p>
          <Link href="/list" className="text-brand-600 underline">
            Create your first listing
          </Link>
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((l) => (
          <li key={l.id} className="rounded-lg border border-black/10 overflow-hidden bg-white">
            <Link href={`/list/${l.id}`} className="block">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {l.cover_url ? (
                  <img
                    src={l.cover_url}
                    alt={l.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link href={`/list/${l.id}`} className="font-semibold hover:underline">
                {l.title || "Untitled"}
              </Link>

              <div className="mt-1 text-sm text-gray-600">
                {typeof l.price === "number" ? `$${l.price.toFixed(2)}/hr` : "—"}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/list/${l.id}/edit`}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Edit
                </Link>
                <Link
                  href={`/list/${l.id}`}
                  className="rounded-md bg-black text-white px-3 py-1.5 text-sm hover:opacity-90"
                >
                  View
                </Link>
                {!l.is_public && (
                  <span className="ml-auto rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}