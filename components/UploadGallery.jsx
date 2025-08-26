"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Limits
const MAX_FILES = 12;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * UploadGallery
 * Stores public URLs in listings.image_urls (jsonb array).
 * Storage path: <bucket>/user/<uid>/listing/<listingId>/<random>-<filename>
 */
export default function UploadGallery({
  listingId,
  bucketName = "listings",
  onChange, // optional callback(newUrls)
}) {
  const [imageUrls, setImageUrls] = useState([]); // string[]
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Public URL prefix for building & stripping paths
  const PUBLIC_PREFIX = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
    return `${base}/storage/v1/object/public/${bucketName}/`;
  }, [bucketName]);

  useEffect(() => {
    let active = true;
    if (!listingId) return;

    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("image_urls")
        .eq("id", listingId)
        .single();

      if (!active) return;
      if (!error && Array.isArray(data?.image_urls)) {
        setImageUrls(data.image_urls);
      }
    })();

    return () => {
      active = false;
    };
  }, [listingId]);

  function publicUrlFor(path) {
    return `${PUBLIC_PREFIX}${path}`;
  }

  function pathFromPublicUrl(url) {
    return url.replace(PUBLIC_PREFIX, "");
  }

  function validateFiles(files) {
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        return "Only JPG/PNG/WebP/AVIF images are allowed.";
      }
      if (f.size > MAX_SIZE) {
        return `Max file size is ${Math.round(MAX_SIZE / (1024 * 1024))}MB.`;
      }
    }
    return null;
  }

  async function uploadOne(file, uid) {
    const safe = file.name.replace(/\s+/g, "_");
    const key = `user/${uid}/listing/${listingId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safe}`;

    const { error: upErr } = await supabase
      .storage
      .from(bucketName)
      .upload(key, file, { cacheControl: "3600", upsert: false });

    if (upErr) throw upErr;
    return publicUrlFor(key);
  }

  async function onChoose(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!listingId) {
      setError("Create the listing first, then add photos.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (imageUrls.length + files.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} images in total.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const v = validateFiles(files);
    if (v) {
      setError(v);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

      const newlyUploaded = [];
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadOne(file, user.id);
        newlyUploaded.push(url);
      }

      const next = [...imageUrls, ...newlyUploaded];

      const { error: dbErr } = await supabase
        .from("listings")
        .update({ image_urls: next })
        .eq("id", listingId);

      if (dbErr) throw dbErr;

      setImageUrls(next);
      onChange?.(next);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove(url) {
    if (!confirm("Remove this image?")) return;
    try {
      const path = pathFromPublicUrl(url);
      await supabase.storage.from(bucketName).remove([path]);

      const next = imageUrls.filter((u) => u !== url);
      const { error: dbErr } = await supabase
        .from("listings")
        .update({ image_urls: next })
        .eq("id", listingId);

      if (dbErr) throw dbErr;
      setImageUrls(next);
      onChange?.(next);
    } catch (err) {
      setError(err.message || "Failed to remove image.");
    }
  }

  return (
    <div className="space-y-3">
      {/* Picker */}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          hidden
          onChange={onChoose}
          disabled={uploading || !listingId}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !listingId}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            listingId
              ? "bg-cyan-600 text-white hover:bg-cyan-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Upload photos
        </button>
        <span className="text-xs text-gray-500">
          Up to {MAX_FILES} images, {Math.round(MAX_SIZE / (1024 * 1024))}MB each.
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Thumbs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {imageUrls.map((url) => (
          <div key={url} className="relative group rounded border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-32 w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(url)}
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