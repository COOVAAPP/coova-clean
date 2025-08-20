"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [images, setImages] = useState([]); // array of urls
  const [videoUrl, setVideoUrl] = useState("");

  const fileRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = `/login?redirect=${encodeURIComponent(`/list/${id}/edit`)}`; return; }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();
      if (!active) return;
      if (error || !data) { alert("Listing not found."); router.replace("/dashboard"); return; }

      // owner guard
      if (data.owner_id !== session.user.id) {
        alert("You don’t have access to this listing.");
        router.replace("/dashboard");
        return;
      }

      setTitle(data.title || "");
      setPrice(String(data.price ?? ""));
      setDescription(data.description || "");
      setStatus(data.status || "draft");
      setImages(Array.isArray(data.images) ? data.images : []);
      setVideoUrl(data.video_url || "");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, router]);

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (price === "" || Number.isNaN(Number(price))) return false;
    return true;
  }, [title, price]);

  async function onSave(e) {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        price: Number(price),
        description: description?.trim() || null,
        status,
        images,
        video_url: videoUrl?.trim() || null,
      };

      const { error } = await supabase
        .from("listings")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      alert("Saved");
    } catch (err) {
      alert(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function onUploadFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploaded = [];
    for (const file of files) {
      const path = `listings/${id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("Public").upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (upErr) { alert(upErr.message); continue; }

      const { data } = supabase.storage.from("Public").getPublicUrl(path);
      if (data?.publicUrl) uploaded.push(data.publicUrl);
    }

    if (uploaded.length) setImages(prev => [...prev, ...uploaded]);
    // clear input
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(url) {
    setImages(prev => prev.filter(u => u !== url));
  }

  if (loading) return <main className="container-page py-10">Loading…</main>;

  return (
    <main className="container-page py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <a href={`/listings/${id}`} className="btn" target="_blank">View Public Page</a>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text" value={title} onChange={(e)=>setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (USD per hour)</label>
            <input
              type="number" step="0.01" inputMode="decimal"
              value={price} onChange={(e)=>setPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status} onChange={(e)=>setStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={6} value={description} onChange={(e)=>setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            ref={fileRef}
            type="file" multiple accept="image/*" onChange={onUploadFiles}
            className="block"
          />
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((u) => (
                <div key={u} className="relative rounded overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={()=>removeImage(u)}
                    className="absolute top-1 right-1 rounded bg-black/60 text-white px-2 py-0.5 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video URL (optional, up to ~3 min)</label>
          <input
            type="url"
            value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            placeholder="https://… (YouTube, Vimeo, or direct mp4)"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={!canSave || saving} className="btn primary">
            {saving ? "Saving…" : "Save"}
          </button>
          <a href="/dashboard" className="btn">Back to Dashboard</a>
        </div>
      </form>
    </main>
  );
}