"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Where images live (public bucket recommended)
const BUCKET = "listings";

export default function UploadGallery({ listingId }) {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // Load existing images
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("listing_assets")
        .select("*")
        .eq("listing_id", listingId)
        .eq("type", "image")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (!active) return;
      if (error) {
        console.error(error);
        setAssets([]);
      } else {
        setAssets(data || []);
      }
    })();
    return () => {
      active = false;
    };
  }, [listingId]);

  // Open file picker
  function openPicker() {
    inputRef.current?.click();
  }

  // Upload handler
  async function onChoose(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      let position = (assets[assets.length - 1]?.position ?? -1) + 1;

      for (const file of files) {
        // 1) upload to storage
        const safeName = file.name.replace(/\s+/g, "_");
        const key = `user/${user.id}/listing/${listingId}/${Date.now()}-${safeName}`;

        const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
        const url = urlData.publicUrl;

        // 2) insert DB row
        const { data: row, error: insErr } = await supabase
          .from("listing_assets")
          .insert({
            listing_id: listingId,
            owner_id: user.id,
            type: "image",
            url,
            mime: file.type,
            position,
          })
          .select("*")
          .single();

        if (insErr) throw insErr;

        position += 1;
        setAssets((a) => [...a, row]);
      }
    } catch (err) {
      alert(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(asset) {
    if (!confirm("Remove this image?")) return;

    // best-effort: derive storage path from URL (optional)
    // you can keep this simple and only delete DB row if your URLs don’t map 1:1 to paths.
    const { error: delErr } = await supabase
      .from("listing_assets")
      .delete()
      .eq("id", asset.id);

    if (delErr) {
      alert(delErr.message);
      return;
    }

    setAssets((a) => a.filter((x) => x.id !== asset.id));
  }

  return (
    <div className="space-y-3">
      {/* Hidden native input + our visible CTA */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={onChoose}
        className="hidden"
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload photos"}
      </button>

      {/* Thumbs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {assets.map((a) => (
          <div key={a.id} className="relative group border rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt="" className="w-full h-32 object-cover" />
            <button
              onClick={() => remove(a)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}