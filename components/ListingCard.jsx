// components/ListingCard.jsx
import Image from "next/image";
import Link from "next/link";

const PRICE_IS_CENTS = false; // flip to true if your DB stores cents (integers)

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    city,
    price_per_hour,
    cover_url,
    image_url,
    image_urls,
  } = listing || {};

  // Pick a hero image
  const hero =
    cover_url ||
    image_url ||
    (Array.isArray(image_urls) && image_urls.length ? image_urls[0] : null);

  // Format price
  const raw = typeof price_per_hour === "number" ? price_per_hour : null;
  const display = raw == null
    ? null
    : PRICE_IS_CENTS
      ? `$${(raw / 100).toLocaleString()}`
      : `$${raw.toLocaleString()}`;

  return (
    <Link
      href={`/listing/${id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-50">
        {hero ? (
          <Image
            src={hero}
            alt={title || "Listing"}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No photo
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">
          {title || "Listing"}
        </p>
        {city ? (
          <p className="mt-1 text-xs text-gray-500">{city}</p>
        ) : null}
        {display ? (
          <p className="mt-2 text-sm font-bold">
            {display}
            <span className="ml-1 text-xs text-gray-500">/ hour</span>
          </p>
        ) : null}
        {typeof listing?.distance_km === "number" && Number.isFinite(listing.distance_km) ? (
          <p className="mt-1 text-xs text-gray-500">
            {(listing.distance_km * 0.621371).toFixed(1)} mi away
          </p>
        ) : null}
      </div>
    </Link>
  );
}