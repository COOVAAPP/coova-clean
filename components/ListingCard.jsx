// components/ListingCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

function money(num) {
  if (num == null) return "$0";
  return `$${Number(num).toLocaleString()}`;
}

function kmToMiles(km) {
  if (km == null) return null;
  return km * 0.621371;
}

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    city,
    price_per_hour: pricePerHour,
    cover_url: coverUrl,
    distanceKm, // optional: provided by /api/browse when lat/lng are sent
  } = listing || {};
  
  {typeof listing.distance_meters === "number" && (
  <p className="mt-1 text-xs text-gray-500">
    {(listing.distance_meters / 1609.344).toFixed(1)} mi away
  </p>
)}
  const miles = kmToMiles(distanceKm);
  const distanceLabel =
    typeof miles === "number"
      ? `${miles.toFixed(1)} mi`
      : distanceKm != null
      ? `${Number(distanceKm).toFixed(1)} km`
      : null;

  return (
    <Link
      href={`/listing/${id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow transition"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-gray-50">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title || "Listing"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo
          </div>
        )}

        {/* Distance pill (if available) */}
        {distanceLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
            {distanceLabel} away
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">{title || "Listing"}</p>
        <p className="mt-1 text-xs text-gray-500">
          {city || ""}
        </p>
        <p className="mt-2 text-sm font-extrabold text-gray-900">
          {money(pricePerHour)}
          <span className="ml-1 text-xs font-normal text-gray-500">/ hour</span>
        </p>
      </div>
    </Link>
  );
}