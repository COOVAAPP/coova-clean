"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadBox({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  async function handleUpload() {
    try {
      setError(null);
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
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const clean = file.name.replace(/[^\w.-]+/g, "");
      const filename = `${Date.now()}_${clean}`;
      const filePath = `user/${userId}/${filename}`;

      setUploading(true);

      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || `image/${ext}`
        });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage
        .from("listings")
        .getPublicUrl(filePath);

      setPreviewUrl(pub.publicUrl);
      onUploaded?.(pub.publicUrl);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="label">Photo</label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="input"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="btn btn-primary"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="rounded-lg border border-slate-200 max-h-48"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}