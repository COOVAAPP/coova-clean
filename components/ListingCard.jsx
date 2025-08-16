// components/ListingCard.jsx
export default function ListingCard({ item }) {
  const img =
    item?.cover_url ||
    item?.image_url ||
    (Array.isArray(item?.photos) && item.photos[0]) ||
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop";

  return (
    <a href={`/listings/${item?.id}`} className="card hover:shadow-md transition">
      <img
        src={img}
        alt={item?.title || "Listing"}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="card-title line-clamp-1">
            {item?.title || item?.name || "Untitled"}
          </h3>
          {item?.price_hour != null && (
            <span className="text-sm font-semibold">${item.price_hour}/hr</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 line-clamp-1">
          {item?.city || item?.location || "—"}
        </p>
      </div>
    </a>
  );
}