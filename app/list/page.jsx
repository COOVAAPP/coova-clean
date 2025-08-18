"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [router]);

  const canCreate = useMemo(() => {
    if (!title.trim()) return false;
    if (price === "" || Number.isNaN(Number(price))) return false;
    return true;
  }, [title, price]);

  async function onCreate(e) {
    e.preventDefault();
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const payload = {
        title: title.trim(),
        price: Number(price),
        description: description?.trim() || null,
        is_public: false,
        owner_id: user.id,
        status: "draft",
      };

      const { data, error } = await supabase
        .from("listings")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;

      router.replace(`/list/${data.id}/edit`);
    } catch (err) {
      alert(err.message || "Failed to create listing.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <main className="container-page py-10"><p>Loading…</p></main>;
  }

  return (
    <main className="container-page py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create a Listing</h1>
      <form onSubmit={onCreate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text" value={title} onChange={(e)=>setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            placeholder="Cozy backyard pool"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (USD per hour)</label>
          <input
            type="number" inputMode="decimal" step="0.01"
            value={price} onChange={(e)=>setPrice(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            placeholder="99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={6} value={description} onChange={(e)=>setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            placeholder="Describe your space…"
          />
        </div>
        <button type="submit" disabled={!canCreate || creating} className="btn primary">
          {creating ? "Creating…" : "Create & Continue"}
        </button>
      </form>
    </main>
  );
}