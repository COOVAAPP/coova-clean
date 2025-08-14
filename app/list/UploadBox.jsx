"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState(null);
  const [error, setError] = useState(null);

  async function onUpload() {
    try {
      setError(null);
      setPublicUrl(null);

      if (!file) {
        setError("Choose an image first.");
        return;
      }

      // must be signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be signed in.");
        return;
      }

      const userId = session.user.id;
      const ext =
        (file.name.split(".").pop() || "jpg")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
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

      const { data } = supabase.storage.from("listings").getPublicUrl(filePath);
      setPublicUrl(data.publicUrl || null);
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section style={{ marginTop: 24, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Upload a cover image</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={onUpload} disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {publicUrl && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: "#666" }}>Public URL</div>
          <input
            style={{ width: "100%" }}
            readOnly
            value={publicUrl}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div style={{ marginTop: 12 }}>
            <img
              src={publicUrl}
              alt="Uploaded"
              style={{ maxWidth: "100%", borderRadius: 6, border: "1px solid #eee" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}