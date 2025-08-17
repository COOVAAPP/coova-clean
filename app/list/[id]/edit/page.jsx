"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadGallery from "@/components/UploadGallery";
import VideoUpload from "@/components/VideoUpload";

export default function EditListingPage({ params }) {
  const listingId = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();
      if (!active) return;
      if (error) {
        alert("Failed to load listing.");
      } else if (data) {
        setListing(data);
        setTitle(data.title ?? "");
        setPrice(data.price ?? "");
        setDescription(data.description ?? "");
        setIsPublic(Boolean(data.is_public));
        setStatus(data.status ?? "draft");
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [listingId]);

  const canSave = useMemo(() => {
    if (!title?.trim()) return false;
    if (price === "" || Number.isNaN(Number(price))) return false;
    return true;
  }, [title, price]);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        price: Number(price),
        description: description?.trim() || null,
        is_public: isPublic,
        status,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("listings").update(payload).eq("id", listingId);
      if (error) throw error;
      alert("Listing saved.");
      router.refresh();
    } catch (e) {
      alert("Failed to save listing.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("listings").delete().eq("id", listingId);
      if (error) throw error;
      alert("Listing deleted.");
      router.push("/list");
    } catch {
      alert("Failed to delete listing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="container-page py-16"><p className="text-gray-600">Loading…</p></main>;
  }

  if (!listing) {
    return <main className="container-page py-16"><p className="text-red-600">Listing not found.</p></main>;
  }

  return (
    <main className="container-page py-10 space-y-12">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-gray-600">ID: {listingId}</p>
        </div>
        <button onClick={onDelete} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
          Delete
        </button>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              placeholder="Cozy backyard pool"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (USD per hour)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={price}
              onChange={(e)=>setPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              placeholder="99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              placeholder="Describe your space…"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4"
                checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)} />
              <span className="text-sm">Public (visible in Browse)</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onSave}
              disabled={!canSave || saving}
              className="px-5 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-3">Photos</h2>
            <UploadGallery listingId={listingId} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Promo Video (max 3 minutes)</h2>
            <VideoUpload listingId={listingId} />
          </div>
        </div>
      </section>
    </main>
  );
}