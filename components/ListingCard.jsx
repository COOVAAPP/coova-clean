import Link from "next/link";

export default function ListingCard({ listing }) {
  const img =
    (Array.isArray(listing.image_urls) && listing.image_urls[0]) ||
    listing.image_url ||
    "https://images.unsplash.com/photo-1505692794403-34d4982a83be?q=80&w=1600&auto=format&fit=crop";

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition"
    >
      <div className="aspect-[4/3] bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={listing.title || "Listing image"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{listing.title}</h3>
          <span className="text-brand-600 font-bold">
            ${Number(listing.price || 0).toFixed(0)}
          </span>
        </div>
        {listing.city || listing.state ? (
          <p className="text-sm text-gray-600 mt-1">
            {[listing.city, listing.state].filter(Boolean).join(", ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}