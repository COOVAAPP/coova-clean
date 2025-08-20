"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { uploadToBucket, insertAsset, deleteAsset } from "@/lib/supabaseStorage";

const MAX_SECONDS = 180;

export default function VideoUpload({ listingId }) {
  const [videoAsset, setVideoAsset] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("listing_assets")
      .select("*")
      .eq("listing_id", listingId)
      .eq("type", "video")
      .limit(1)
      .single()
      .then(({ data }) => { if (active) setVideoAsset(data || null); })
      .catch(() => {});
    return () => { active = false; };
  }, [listingId]);

  async function validateDuration(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const secs = Math.round(v.duration || 0);
        if (secs > MAX_SECONDS) reject(new Error(`Video exceeds ${MAX_SECONDS} seconds`));
        else resolve(secs);
      };
      v.onerror = () => reject(new Error("Cannot read video metadata"));
      v.src = url;
    });
  }

  async function onChoose(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const duration_s = await validateDuration(f);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      if (videoAsset) {
        await deleteAsset(videoAsset);
        setVideoAsset(null);
      }

      const key = `user/${user.id}/listing/${listingId}/${Date.now()}-${f.name}`;
      const publicUrl = await uploadToBucket("listing-videos", f, key);

      const row = await insertAsset({
        listing_id: listingId,
        owner_id: user.id,
        type: "video",
        url: publicUrl,
        mime: f.type,
        duration_s,
        position: 0,
      });

      setVideoAsset(row);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (!videoAsset) return;
    if (!confirm("Remove video?")) return;
    await deleteAsset(videoAsset);
    setVideoAsset(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={onChoose}
          disabled={busy}
        />
        {busy ? <span className="text-sm text-gray-600">Uploading…</span> : null}
      </div>

      {videoAsset ? (
        <div className="space-y-2">
          <video src={videoAsset.url} controls className="w-full rounded border" />
          <button className="btn" onClick={remove}>Remove Video</button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Add a video up to 3 minutes.</p>
      )}
    </div>
  );
}