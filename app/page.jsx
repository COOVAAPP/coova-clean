"use client";

import Link from "next/link";
import RotatingHero from "@/components/RotatingHero";
import CategoryCard from "@/components/CategoryCard";

const categories = [
  {
    title: "Pools & Venues",
    href: "/browse?type=pools",
    img: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/pools.jpg",
  },
  {
    title: "Luxury Cars",
    href: "/browse?type=cars",
    img: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/cars.jpg",
  },
  {
    title: "Unique Spaces",
    href: "/browse?type=spaces",
    img: "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/spaces.jpg",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <RotatingHero />

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {categories.map((c) => (
            <CategoryCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-12 text-cyan-500">
        <h2 className="text-center text-3xl font-bold">
          Become a Host and Earn with Your Space
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </p>
        <div className="mt-6 text-center">
          <Link
            href="/list"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-gray-100"
          >
            Start Hosting
          </Link>
        </div>
      </section>
    </main>
  );
}