"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ---------------------------
// Config
// ---------------------------
const MAX_FILES = 12;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const STORAGE_BUCKET = "listings"; // make sure this bucket exists & is public

// Optional: categories you want to show
const CATEGORIES = [
  "Studio",
  "Event Space",
  "Outdoor",
  "Kitchen",
  "Office",
  "Gallery",
  "Other",
];

// Optional: amenity suggestions (you can add/remove freely)
const AMENITY_SUGGESTIONS = [
  "Wifi",
  "Parking",
  "A/C",
  "Heat",
  "Power",
  "Restroom",
  "Lighting",
  "Sound System",
  "Kitchen",
  "Changing Room",
];

export default function CreateListingClient() {
  const router = useRouter();

  // Auth / user
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Studio");
  const [capacity, setCapacity] = useState(1);
  const [price, setPrice] = useState(""); // dollars (string in UI)
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // {url, name, size, type}[]
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  // ---------------------------
  // Load current session
  // ---------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const uid = data?.session?.user?.id || null;
      setUserId(uid);
      setLoadingUser(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---------------------------
  // Image previews (clean up URLs)
  // ---------------------------
  useEffect(() => {
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setPreviews(urls);
    return () => urls.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  // ---------------------------
  // Handlers
  // ---------------------------
  function onPickFiles(e) {
    setError("");
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;

    // validate & cap
    const current = [...files];
    for (const f of list) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError("Only JPG/PNG/WebP/AVIF images are allowed.");
        continue;
      }
      if (f.size > MAX_SIZE) {
        setError(`Max file size is ${Math.round(MAX_SIZE / (1024 * 1024))}MB.`);
        continue;
      }
      if (current.length >= MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} images.`);
        break;
      }
      current.push(f);
    }
    setFiles(current);
    // reset input so same file can be reselected later
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx) {
    setFiles((arr) => arr.filter((_, i) => i !== idx));
  }

  function addAmenityFromInput() {
    const v = amenityInput.trim();
    if (!v) return;
    if (!amenities.includes(v)) setAmenities((a) => [...a, v]);
    setAmenityInput("");
  }

  function removeAmenity(name) {
    setAmenities((a) => a.filter((x) => x !== name));
  }

  // ---------------------------
  // Upload helpers
  // ---------------------------
  async function uploadOne(file, userId) {
    const safeName = file.name.replace(/\s+/g, "_");
    const key = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(key, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (upErr) throw upErr;

    // if bucket is public, you can use public URL:
    const { data: publicData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(key);

    return { path: key, url: publicData.publicUrl };
  }

  // ---------------------------
  // Submit
  // ---------------------------
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Please sign in to create a listing.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError("Price must be a valid number.");
      return;
    }

    try {
      setSubmitting(true);

      // Upload images (if any)
      let uploaded = [];
      for (const f of files) {
        // eslint-disable-next-line no-await-in-loop
        const u = await uploadOne(f, userId);
        uploaded.push(u);
      }

      // Convert price dollars → cents (integers)
      const price_cents = Math.round(Number(price) * 100);

      // Choose cover image (first uploaded) if available
      const cover_image = uploaded[0]?.path || null;
      const images = uploaded.map((u) => u.path);

      // Insert into DB
      const insertPayload = {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
        capacity: Number(capacity) || 1,
        price_cents,
        amenities,
        cover_image,
        images,
      };

      const { data: row, error: dbErr } = await supabase
        .from("listings")
        .insert(insertPayload)
        .select("*")
        .single();

      if (dbErr) throw dbErr;

      setSuccess("Listing created successfully!");
      // Optional: route to the new listing page
      setTimeout(() => {
        router.push(`/listing/${row.id}`);
      }, 800);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = useMemo(() => {
    return submitting || loadingUser;
  }, [submitting, loadingUser]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-md border border-gray-200 bg-white p-6 shadow"
    >
      {/* Title */}
      <div>
        <label className="block text-sm font-bold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          placeholder="e.g., Natural Light Loft with City View"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold">Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          placeholder="Describe the space, best uses, access notes, house rules, etc."
        />
      </div>

      {/* Category + Capacity + Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-bold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold">Capacity</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold">Price (USD per hour)</label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-bold">Amenities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
            >
              {a}
              <button
                type="button"
                className="rounded-full px-1 text-gray-400 hover:text-gray-700"
                onClick={() => removeAmenity(a)}
                aria-label="Remove amenity"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAmenityFromInput();
              }
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            placeholder="Add an amenity and press Enter"
          />
          <button
            type="button"
            className="rounded-md border px-3 font-bold hover:bg-gray-50"
            onClick={addAmenityFromInput}
          >
            Add
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {AMENITY_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (!amenities.includes(s)) setAmenities((a) => [...a, s]);
              }}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-cyan-300 hover:bg-cyan-50"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-bold">Photos</label>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={onPickFiles}
          className="mt-2 block w-full text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Up to {MAX_FILES} images, {Math.round(MAX_SIZE / (1024 * 1024))}MB max
          each. JPG/PNG/WebP/AVIF.
        </p>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="relative overflow-hidden rounded-md border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.name}
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="rounded-md border px-4 py-2 font-bold hover:bg-gray-50"
          onClick={() => router.back()}
          disabled={isDisabled}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className="rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Create listing"}
        </button>
      </div>
    </form>
  );
}