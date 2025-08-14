"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadBox({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);

  const onUpload = async () => {
    try {
      setError(null);
      if (!file) {
        setError("Choose an image first.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("You must be signed in.");
        return;
      }

      const userId = session.user.id;
      // sanitize & unique name
      const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
      const filename = `${Date.now()}.${ext}`;
      const filePath = `user/${userId}/${filename}`;

      setUploading(true);
      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
      if (upErr) throw upErr;

      // get a public URL
      const { data: pub } = supabase.storage.from("listings").getPublicUrl(filePath);
      setPublicUrl(pub.publicUrl || null);

      if (onUploaded && pub?.publicUrl) onUploaded(pub.publicUrl);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", padding: 12, borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button className="btn" type="button" onClick={onUpload} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}
      {publicUrl && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          Uploaded ✓
        </div>
      )}
    </div>
  );
}