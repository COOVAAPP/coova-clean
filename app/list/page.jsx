"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

const BUCKET = "listing-images";
const MAX_IMAGES = 8;
const MAX_MB = 10; // per image
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function ListPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // dollars string -> cents on submit
  const [address, setAddress] = useState("");

  // images (local previews + uploaded paths)
  const [files, setFiles] = useState([]); // [{file, previewUrl}] pre-upload
  const [uploadedPaths, setUploadedPaths] = useState([]); // storage paths
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      // verify 18+
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("verified_18")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (error || !prof?.verified_18) {
        router.replace("/verify-age");
        return;
      }

      setSession(data.session);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 3 &&
      price.trim() !== "" &&
      Number.isFinite(Number(price)) &&
      Number(price) >= 0 &&
      uploadedPaths.length > 0 &&
      !saving &&
      !uploading
    );
  }, [title, price, uploadedPaths, saving, uploading]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function handlePick(e) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const existing = files.length;
    const availableSlots = Math.max(0, MAX_IMAGES - existing);
    const chosen = picked.slice(0, availableSlots);

    const tooBig = chosen.find((f) => f.size > MAX_BYTES);
    if (tooBig) {
      showToast(`Each image must be ≤ ${MAX_MB}MB`);
      return;
    }

    const withPreviews = chosen.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...withPreviews]);
  }

  async function uploadAll() {
    if (!session || !files.length) return;
    setUploading(true);
    try {
      const userId = session.user.id;
      const paths = [];

      for (const item of files) {
        const file = item.file;
        const safe = file.name.replace(/\s+/g, "-");
        const path = `${userId}/${Date.now()}-${safe}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: true });

        if (error) throw error;
        paths.push(path);
      }

      setUploadedPaths(paths);
      showToast("Images uploaded");
    } catch (err) {
      console.error(err);
      showToast(`Upload error: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  }

  function removeLocal(index) {
    setFiles((prev) => {
      const cp = [...prev];
      const removed = cp.splice(index, 1)[0];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return cp;
    });
  }

  async function removeUploaded(path) {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw error;
      setUploadedPaths((prev) => prev.filter((p) => p !== path));
      showToast("Removed");
    } catch (err) {
      console.error(err);
      showToast(`Remove error: ${err.message || err}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session) return;

    // If user picked files but didn’t upload yet
    if (files.length && uploadedPaths.length === 0) {
      showToast("Please Upload images first");
      return;
    }

    const cents = Math.round(Number(price) * 100);

    setSaving(true);
    try {
      const { error } = await supabase.from("listings").insert({
        owner_id: session.user.id,
        title: title.trim(),
        description: description.trim() || null,
        price_cents: cents,
        address: address.trim() || null,
        images: uploadedPaths,
      });

      if (error) throw error;

      showToast("✅ Listing created!");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err) {
      console.error(err);
      showToast(`Save error: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">List your space</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">
        List your space
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-gray-200 bg-white p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            placeholder="Cozy backyard with pool…"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            placeholder="Tell guests about your space and rules…"
          />
        </div>

        {/* Price & Address */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Price (USD)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              required
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Address (optional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              placeholder="City, State"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-600">Images</label>
            <span className="text-xs text-gray-500">
              {files.length || uploadedPaths.length}/{MAX_IMAGES} selected
            </span>
          </div>

          {/* picker */}
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50">
              Choose images
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePick} />
            </label>

            <button
              type="button"
              onClick={uploadAll}
              disabled={uploading || files.length === 0}
              className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:text-black disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>

          {/* local previews (before upload) */}
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {files.map((it, idx) => (
                <div key={idx} className="relative rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.previewUrl} alt="" className="h-32 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeLocal(idx)}
                    className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* uploaded gallery */}
          {uploadedPaths.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {uploadedPaths.map((p) => (
                <UploadedThumb key={p} path={p} onRemove={() => removeUploaded(p)} />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Create listing"}
        </button>

        {toast && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
      </form>
    </main>
  );
}

/** Thumbnail using public URL from the bucket. */
function UploadedThumb({ path, onRemove }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      // Because the bucket is public, we can use getPublicUrl
      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      if (active) setUrl(data.publicUrl);
    })();
    return () => { active = false; };
  }, [path]);

  return (
    <div className="relative rounded-md overflow-hidden border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-32 w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded bg-white/90 px-2 py-0.5 text-xs font-bold"
      >
        Remove
      </button>
    </div>
  );
}