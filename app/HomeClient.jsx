// app/HomeClient.jsx
"use client";

export default function HomeClient() {
  // Static demo cards; replace URLs if your paths differ
  const cards = [
    {
      href: "/browse?type=pools",
      label: "Pools & Venues",
      src:
        "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/pools.jpg",
    },
    {
      href: "/browse?type=cars",
      label: "Luxury Cars",
      src:
        "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/cars.jpg",
    },
    {
      href: "/browse?type=spaces",
      label: "Unique Spaces",
      src:
        "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/spaces.jpg",
    },
  ];

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {cards.map(({ href, label, src }) => (
        <a
          key={label}
          href={href}
          className="group relative block w-full max-w-[384px] overflow-hidden rounded-2xl shadow hover:shadow-lg transition"
          aria-label={label}
        >
          <img
            src={src}
            alt={label}
            className="h-[180px] sm:h-[240px] md:h-[300px] lg:h-[384px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-black/40" />
          <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}