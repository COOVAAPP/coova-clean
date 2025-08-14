"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadBox({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e) {
    e.preventDefault();
    setError("");

    const fileInput = document.getElementById("fileInput");
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("You must be signed in.");
      return;
    }

    const userId = session.user.id;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const filename = `${Date.now()}.${ext}`;
    const filePath = `user/${userId}/${filename}`;

    setUploading(true);
    try {
      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("listings").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Could not resolve public URL.");

      onUploaded?.(publicUrl);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="upload">
      <input id="fileInput" className="input input--file" type="file" accept="image/*" />
      <button className="btn btn--success" onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}