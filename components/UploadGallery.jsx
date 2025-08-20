"use client";

import { useEffect, useRef, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { uploadToBucket, insertAsset, deleteAsset } from "@/lib/supabaseStorage";

export default function UploadGallery({ listingId }) {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("listing_assets")
      .select("*")
      .eq("listing_id", listingId)
      .eq("type", "image")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (active) setAssets(data || []); });
    return () => { active = false; };
  }, [listingId]);

  async function onChoose(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      let position = (assets[assets.length - 1]?.position ?? -1) + 1;

      for (const file of files) {
        const key = `user/${user.id}/listing/${listingId}/${Date.now()}-${file.name}`;
        const publicUrl = await uploadToBucket("listing-images", file, key);

        const row = await insertAsset({
          listing_id: listingId,
          owner_id: user.id,
          type: "image",
          url: publicUrl,
          mime: file.type,
          position,
        });

        position += 1;
        setAssets(a => [...a, row]);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(asset) {
    if (!confirm("Remove this image?")) return;
    await deleteAsset(asset);
    setAssets(a => a.filter(x => x.id !== asset.id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onChoose}
          disabled={uploading}
        />
        {uploading ? <span className="text-sm text-gray-600">Uploading…</span> : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {assets.map((a) => (
          <div key={a.id} className="relative group border rounded overflow-hidden">
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