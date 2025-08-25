"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadToBucket, insertAsset, deleteAsset } from "@/lib/supabaseStorage";

const BUCKET = "listing-images"; // adjust if your helper expects another bucket

export default function UploadGallery({ listingId }) {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  // load
  useEffect(() => {
    let active = true;
    if (!listingId) return;
    supabase
      .from("listing_assets")
      .select("*")
      .eq("listing_id", listingId)
      .eq("type", "image")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (active) setAssets(data || []);
      });
    return () => {
      active = false;
    };
  }, [listingId]);

  // choose
  const onChoose = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await doUpload(files);
    if (inputRef.current) inputRef.current.value = "";
  }, [assets]);

  // drag & drop
  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;
    await doUpload(files);
  }, [assets]);

  const doUpload = useCallback(async (files) => {
    if (!listingId) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      let position = (assets[assets.length - 1]?.position ?? -1) + 1;

      for (const file of files) {
        const key = `user/${user.id}/listing/${listingId}/${Date.now()}-${file.name}`;
        const publicUrl = await uploadToBucket(BUCKET, file, key);

        const row = await insertAsset({
          listing_id: listingId,
          owner_id: user.id,
          type: "image",
          url: publicUrl,
          mime: file.type,
          position,
        });

        position += 1;
        setAssets((a) => [...a, row]);
      }
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [listingId, assets]);

  async function remove(asset) {
    if (!confirm("Remove this image?")) return;
    await deleteAsset(asset);
    setAssets((a) => a.filter((x) => x.id !== asset.id));
  }

  return (
    <div className="space-y-3">
      {/* uploader */}
      <div
        className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition ${
          dragOver ? "border-cyan-600 bg-cyan-50" : "border-gray-300"
        }`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="text-sm text-gray-600 mb-3">
          Drag & drop images here, or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onChoose}
        />
        <p className="mt-2 text-xs text-gray-500">
          JPG/PNG/WebP/AVIF recommended. 50MB max each.
        </p>
      </div>

      {/* gallery */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {assets.map((a) => (
          <div key={a.id} className="relative group overflow-hidden rounded border">
            <img src={a.url} alt="" className="h-32 w-full object-cover" />
            <button
              onClick={() => remove(a)}
              className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}