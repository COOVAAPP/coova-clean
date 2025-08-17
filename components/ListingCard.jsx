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
}