// app/dashboard/page.jsx
"use client";

// Do NOT pre-render or cache this page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Ensure we’re signed in
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login?redirect=/dashboard");
        return;
      }

      setSession(session);

      // Load the user’s listings (adjust table/columns to match your schema)
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("[dashboard] load listings error:", error);
      if (mounted) {
        setListings(data || []);
        setLoading(false);
      }
    })();

    // Keep page reactive to auth changes
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) router.replace("/login?redirect=/dashboard");
    });

    return () => {
      mounted = false;
      sub.data?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="container-page py-10">
        <h1 className="text-xl font-bold mb-3">Dashboard</h1>
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {listings.length === 0 ? (
        <p className="text-gray-600">
          You don’t have any listings yet.{" "}
          <a href="/list" className="text-cyan-600 underline">
            Create your first listing
          </a>
          .
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <li key={l.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="font-semibold">{l.title || "Untitled"}</div>
              <div className="text-sm text-gray-500">{l.city || ""}</div>
              <div className="mt-3 space-x-4">
                <a
                  href={`/listing/${l.id}`}
                  className="text-cyan-600 hover:underline"
                >
                  View
                </a>
                <a
                  href={`/listing/${l.id}/edit`}
                  className="text-cyan-600 hover:underline"
                >
                  Edit
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}