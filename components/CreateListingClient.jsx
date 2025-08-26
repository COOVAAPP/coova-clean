"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadGallery from "@/components/UploadGallery";

// ---------------------------
// Config
// ---------------------------
const MAX_FILES = 12;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const CATEGORIES = [
  "Studio",
  "Event Space",
  "Outdoor",
  "Kitchen",
  "Office",
  "Gallery",
  "Other",
];

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

  // Step/state
  const [listingId, setListingId] = useState(null); // truthy after first save
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load session
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

  // Amenity helpers
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
  // Create a draft row if needed (used by Upload Photos button)
  // ---------------------------
  async function createDraftIfNeeded() {
    if (listingId) return listingId;
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Please sign in to create a listing.");
      throw new Error("Not signed in");
    }
    if (!title.trim()) {
      setError("Title is required.");
      throw new Error("Missing title");
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError("Price must be a valid number.");
      throw new Error("Bad price");
    }

    setSubmitting(true);
    const price_per_hour = Number(price);

    const insertPayload = {
      owner_id: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      capacity: Number(capacity) || 1,
      price_per_hour,
      amenities,
    };

    const { data: row, error: dbErr } = await supabase
      .from("listings")
      .insert(insertPayload)
      .select("*")
      .single();

    setSubmitting(false);

    if (dbErr) {
      setError(dbErr.message);
      throw dbErr;
    }

    setListingId(row.id);
    setSuccess("Listing created! Now add photos and Publish.");
    return row.id;
  }

  // Submit (explicit Create listing button)
  async function onCreateListing(e) {
    e?.preventDefault?.();
    await createDraftIfNeeded();
  }

  // Publish (optional: set cover to first image)
  async function onPublish() {
    if (!listingId) return;
    try {
      setSubmitting(true);
      const { data: assets } = await supabase
        .from("listing_assets")
        .select("*")
        .eq("listing_id", listingId)
        .eq("type", "image")
        .order("position", { ascending: true })
        .limit(1);

      const cover = assets?.[0]?.url || null;
      await supabase
        .from("listings")
        .update({ cover_image: cover })
        .eq("id", listingId);

      router.push(`/listing/${listingId}`);
    } catch (e) {
      setError(e.message || "Failed to publish.");
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = useMemo(
    () => submitting || loadingUser,
    [submitting, loadingUser]
  );

  return (
    <form
      onSubmit={onCreateListing}
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
          disabled={!!listingId}
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
          disabled={!!listingId}
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
            disabled={!!listingId}
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
            disabled={!!listingId}
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
              disabled={!!listingId}
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
              {!listingId && (
                <button
                  type="button"
                  className="rounded-full px-1 text-gray-400 hover:text-gray-700"
                  onClick={() => removeAmenity(a)}
                  aria-label="Remove amenity"
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>

        {!listingId && (
          <>
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

            <div className="mt-3 flex flex-wrap gap-2">
              {AMENITY_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (!amenities.includes(s))
                      setAmenities((a) => [...a, s]);
                  }}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-cyan-300 hover:bg-cyan-50"
                >
                  + {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Photos + Actions */}
      {!listingId ? (
        <>
          {/* Upload photos CTA (creates draft first) */}
          <div>
            <label className="block text-sm font-bold mb-2">Photos</label>
            <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                You’ll need a draft listing to upload photos.
              </p>
              <button
                type="button"
                disabled={isDisabled}
                onClick={async () => {
                  try {
                    await createDraftIfNeeded();
                    // After this, the gallery will render (listingId set)
                  } catch {}
                }}
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Upload photos"}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Up to {MAX_FILES} images, {Math.round(MAX_SIZE / (1024 * 1024))}MB each.
              </p>
            </div>
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

          {/* Step 1 actions */}
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
        </>
      ) : (
        <>
          {/* Once we have an id, render the real gallery uploader */}
          <div>
            <label className="block text-sm font-bold mb-2">Photos</label>
            <UploadGallery listingId={listingId} />
            <p className="mt-2 text-xs text-gray-500">
              Add up to {MAX_FILES} images (50MB each). You can remove or reorder later.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 2 actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-md border px-4 py-2 font-bold hover:bg-gray-50"
              onClick={() => router.push(`/listing/${listingId}`)}
              disabled={isDisabled}
            >
              View draft
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={isDisabled}
              className="rounded-md bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}