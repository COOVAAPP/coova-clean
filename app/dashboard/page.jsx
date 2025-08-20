"use client";

export const dynamic = "force-dynamic";     // never prerender
export const fetchCache = "force-no-store"; // disable fetch cache
export const revalidate = 0;                // no ISR

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      // 1) Ensure user is signed in
      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace("/login?redirect=/dashboard");
        return;
      }

      setSession(session);

      // 2) Load user-owned listings
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (!error) setListings(data || []);
      setLoading(false);
    })();

    return () => { active = false; };
  }, [router]);

  if (loading) {
    return (
      <main className="container-page py-10">
        <p>Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main className="container-page py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <Link href="/list/create" className="btn primary">Create Listing</Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-md border p-6 text-gray-600">
          <p className="mb-3">You don’t have any listings yet.</p>
          <Link href="/list/create" className="btn">Create your first listing</Link>
        </div>
      ) : (
        <ul className="divide-y rounded-md border">
          {listings.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-semibold">{l.title || "Untitled listing"}</div>
                <div className="text-sm text-gray-500">
                  {typeof l.price === "number" ? `$${l.price}/hr` : "No price set"}
                </div>
              </div>
              <div className="space-x-2">
                <Link href={`/list/${l.id}/edit`} className="btn sm">Edit</Link>
                <Link href={`/list/${l.id}`} className="btn sm">View</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}