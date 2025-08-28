// components/ListingCard.jsx
import Link from "next/link";
import Image from "next/image";

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    city,
    price_per_hour,
    cover_url,     // or image_url; adjust if your column is different
  } = listing || {};

  return (
    <Link
      href={`/listing/${id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-50">
        {cover_url ? (
          <Image
            src={cover_url}
            alt={title || "Listing"}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">{title || "Listing"}</p>
        <p className="mt-1 text-xs text-gray-500">{city || ""}</p>
        <p className="mt-2 text-sm font-bold">
          ${Number(price_per_hour ?? 0).toLocaleString()}
          <span className="ml-1 text-xs text-gray-500">/ hour</span>
        </p>
      </div>
    </Link>
  );
}