/// app/HomeClient.jsx
"use client";

import Link from "next/link";

export default function HomeClient() {
  const cards = [
    {
      href: "/browse?type=pools",
      label: "Pools & Venues",
      src: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/pools.jpg",
    },
    {
      href: "/browse?type=cars",
      label: "Luxury Cars",
      src: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/cars.jpg",
    },
    {
      href: "/browse?type=spaces",
      label: "Unique Spaces",
      src: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/spaces.jpg",
    },
  ];

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {cards.map(({ href, label, src }) => (
            <a
              key={label}
              href={href}
              className="group relative block w-full max-w-[384px] overflow-hidden rounded-2xl shadow transition hover:shadow-lg"
              aria-label={label}
            >
              <img
                src={src}
                alt={label}
                className="h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[240px] md:h-[300px] lg:h-[384px]"
              />
              <span className="absolute inset-0 bg-black/40" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
                {label}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 py-12 text-cyan-500">
        <h2 className="text-center text-3xl font-bold">Become a Host and Earn with Your Space</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </p>
        <div className="mt-6 text-center">
          <Link
            href="/list"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-600 shadow hover:bg-gray-100"
          >
            Start Hosting
          </Link>
        </div>
      </section>
    </>
  );
}