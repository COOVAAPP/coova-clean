"use client"

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState(null);
  const [error, setError] = useState(null);

  const onUpload = async () => {
    try {
      setError(null);
      if (!file) {
        setError("Choose an image first.");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be signed in.");
        return;
      }

      const userId = session.user.id;
      const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, "") || "jpg";
      const filename = `${Date.now()}.${ext}`;
      const filePath = `user-${userId}/${filename}`;

      setUploading(true);

      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("listings")
        .getPublicUrl(filePath);

      setPublicUrl(publicUrl);
    } catch (e) {
      setError(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <label className="block text-lg font-semibold mb-2">Photo</label>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full border border-gray-300 rounded p-2"
      />
      <button
        onClick={onUpload}
        disabled={uploading}
        className="btn primary mt-2"
        style={{ display: "inline-block" }}
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {publicUrl && (
        <p className="mt-2">
          Uploaded! <a href={publicUrl} target="_blank" rel="noreferrer">View</a>
        </p>
      )}
    </div>
  );
}