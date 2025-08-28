// app/list/create/CreateListingClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadGallery from "@/components/UploadGallery";

/**
 * Two-step create flow:
 *  1) Save a minimal draft row in `listings`
 *  2) Enable photo uploads (stored in image_urls)
 *  3) Geocode address → lat/lng (via /api/geocode)
 *  4) Publish → sets cover_url/images if missing and routes to /listing/:id
 */

/* ---------------------------------------------
   UI helpers / constants
---------------------------------------------- */
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

/* ---------------------------------------------
   Component
---------------------------------------------- */
export default function CreateListingClient() {
  const router = useRouter();

  // Auth
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [capacity, setCapacity] = useState(1);
  const [pricePerHour, setPricePerHour] = useState(""); // numeric in DB

  // Amenities
  const [amenities, setAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");

  // Location (address parts & geocode result)
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoPending, setGeoPending] = useState(false);

  // Step/state
  const [listingId, setListingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  /* ---------------------------------------------
     Load session
  ---------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const uid = data?.session?.user?.id || null;
      setUserId(uid);
      setLoadingUser(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------
     Amenity helpers
  ---------------------------------------------- */
  function addAmenityFromInput() {
    const v = amenityInput.trim();
    if (!v) return;
    if (!amenities.includes(v)) setAmenities((a) => [...a, v]);
    setAmenityInput("");
  }
  function removeAmenity(name) {
    setAmenities((a) => a.filter((x) => x !== name));
  }

  /* ---------------------------------------------
     Geocode address → lat/lng (via /api/geocode)
  ---------------------------------------------- */
  async function onGeocode() {
    setErr("");
    setInfo("");

    const parts = [address1, city, stateRegion, country].map((s) => s?.trim()).filter(Boolean);
    if (parts.length === 0) {
      setErr("Enter at least one address field before geocoding.");
      return;
    }

    try {
      setGeoPending(true);
      const q = parts.join(", ");
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to geocode");

      // Expect { lat, lng, normalized? }
      if (typeof json.lat === "number" && typeof json.lng === "number") {
        setLat(String(json.lat));
        setLng(String(json.lng));
        setInfo("Location found.");
      } else {
        throw new Error("No coordinates returned for this address.");
      }
    } catch (e) {
      setErr(e.message || "Geocode failed.");
    } finally {
      setGeoPending(false);
    }
  }

  /* ---------------------------------------------
     First save: create minimal listing row
  ---------------------------------------------- */
  async function onCreateListing(e) {
    e?.preventDefault?.();
    setErr("");
    setInfo("");

    if (!userId) {
      setErr("Please sign in to create a listing.");
      return;
    }
    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }
    const priceNumber = Number(pricePerHour);
    if (!pricePerHour || Number.isNaN(priceNumber) || priceNumber < 0) {
      setErr("Price (per hour) must be a valid number.");
      return;
    }

    try {
      setSubmitting(true);

      // We set both user_id and owner_id to be safe with your schema.
      const payload = {
        user_id: userId,
        owner_id: userId,

        title: title.trim(),
        description: description.trim(),
        category,
        capacity: Number(capacity) || 1,
        price_per_hour: priceNumber, // numeric

        amenities, // jsonb array of strings

        // location fields (names aligned to your listing page)
        address_line1: address1?.trim() || null,
        city: city?.trim() || null,
        state: stateRegion?.trim() || null,
        country: country?.trim() || null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,

        // images: start empty; you’re filling image_urls via UploadGallery
        image_urls: [],
        cover_url: null,

        // optional status flags (adjust if your schema differs)
        is_public: true,
        status: "published",
      };

      const { data: row, error: dbErr } = await supabase
        .from("listings")
        .insert(payload)
        .select("id")
        .single();

      if (dbErr) throw dbErr;

      setListingId(row.id);
      setInfo("Listing created! Now add photos and Publish.");
    } catch (e) {
      setErr(e.message || "Could not create listing.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------------------------------------
     Publish: set cover_url/images if missing and route
  ---------------------------------------------- */
  async function onPublish() {
    if (!listingId) return;
    setErr("");
    setInfo("");

    try {
      setSubmitting(true);

      // Read current image_urls & cover_url
      const { data, error: selErr } = await supabase
        .from("listings")
        .select("image_urls, cover_url")
        .eq("id", listingId)
        .single();

      if (selErr) throw selErr;

      const update = { is_public: true, status: "active" };

      // If cover_url empty but we have image_urls, set cover & also sync legacy `images`
      if (!data?.cover_url && Array.isArray(data?.image_urls) && data.image_urls.length > 0) {
        update.cover_url = data.image_urls[0];
        update.images = data.image_urls; // keep `/listing/[id]` page happy
      }

      // Also persist final address/coords in case user geocoded after first save
      update.address_line1 = address1?.trim() || null;
      update.city = city?.trim() || null;
      update.state = stateRegion?.trim() || null;
      update.country = country?.trim() || null;
      update.lat = lat ? Number(lat) : null;
      update.lng = lng ? Number(lng) : null;

      const { error: updErr } = await supabase.from("listings").update(update).eq("id", listingId);
      if (updErr) throw updErr;

      router.push(`/listing/${listingId}`);
    } catch (e) {
      setErr(e.message || "Failed to publish.");
    } finally {
      setSubmitting(false);
    }
  }

  const isDisabled = useMemo(() => submitting || loadingUser, [submitting, loadingUser]);

  /* ---------------------------------------------
     UI
  ---------------------------------------------- */
  return (
    <form onSubmit={onCreateListing} className="space-y-8 rounded-md border border-gray-200 bg-white p-6 shadow">
      <h1 className="text-xl font-extrabold tracking-tight text-cyan-600">Create a new listing</h1>

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
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
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
                    if (!amenities.includes(s)) setAmenities((a) => [...a, s]);
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

      {/* Location */}
      <div>
        <label className="block text-sm font-bold">Location</label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Address line"
            className="rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            disabled={!!listingId && submitting}
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            disabled={!!listingId && submitting}
          />
          <input
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
            placeholder="State / Region"
            className="rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            disabled={!!listingId && submitting}
          />
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            disabled={!!listingId && submitting}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onGeocode}
            disabled={geoPending}
            className="rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-gray-50"
          >
            {geoPending ? "Geocoding…" : "Find on map"}
          </button>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="w-40 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="w-40 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>

        <p className="mt-1 text-xs text-gray-500">
          We’ll save the lat/lng with your listing so guests can search by distance.
        </p>
      </div>

      {/* Step 1 or Step 2 */}
      {!listingId ? (
        <>
          {/* Alerts */}
          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {info}
            </div>
          )}

          {/* Actions */}
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
          {/* Photos */}
          <div>
            <label className="mb-2 block text-sm font-bold">Photos</label>
            <UploadGallery listingId={listingId} />
            <p className="mt-2 text-xs text-gray-500">
              Add up to 12 photos (50MB each). Remove any you don’t want before publishing.
            </p>
          </div>

          {/* Alerts */}
          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {info}
            </div>
          )}

          {/* Actions */}
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