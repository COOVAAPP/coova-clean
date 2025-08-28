import Link from "next/link";

export default function ListingCard({ listing }) {
  const { id, title, price, image_url } = listing;

  return (
    <Link
      href={`/list/${id}`}
      className="block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-gray-100">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">${Number(price || 0).toFixed(0)}</p>
      </div>
    </Link>
  );
}// components/ListingCard.jsx
"use client";

import Link from "next/link";

function money(n) {
  const v = Number(n || 0);
  return `$${v.toLocaleString()}`;
}

export default function ListingCard({ listing }) {
  const cover = listing.cover_url || listing.images?.[0] || "";
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow transition"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {cover ? (
          // Use plain <img> to avoid Next image domain config issues
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.title || "Listing"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No photo</div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">{listing.title || "Untitled"}</p>
        <p className="mt-1 text-xs text-gray-500">
          {listing.city || ""}{listing.category ? ` • ${listing.category}` : ""}
        </p>
        <p className="mt-2 text-sm font-bold">
          {money(listing.price_per_hour)} <span className="text-gray-500 font-normal">/ hour</span>
        </p>
      </div>
    </Link>
  );
}