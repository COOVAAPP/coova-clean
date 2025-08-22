// app/HomeClient.jsx (client component)
"use client";

import Link from "next/link";

// If you already have a Hero component, use it:
import Hero from "@/components/Hero";
// If your project uses a safer/leaner hero, you can swap to this instead:
// import SafeHero from "@/components/SafeHero";

export default function HomeClient() {
  return (
    <div className="flex min-h-screen flex-col">

      {/* ===== HERO ===== */}
      {/* If you prefer SafeHero just replace <Hero /> with <SafeHero /> */}
      <section className="w-full">
        <Hero />
      </section>

      {/* ===== CATEGORY CARDS ===== */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">

          {/* Pools & Venues */}
          <a
            href="/browse?type=pools"
            className="group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition"
            aria-label="Pools & Venues"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/pools.jpg"
              alt="Pools & Venues"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Pools & Venues
            </span>
          </a>

          {/* Luxury Cars */}
          <a
            href="/browse?type=cars"
            className="group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition"
            aria-label="Luxury Cars"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/cars.jpg"
              alt="Luxury Cars"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Luxury Cars
            </span>
          </a>

          {/* Unique Spaces */}
          <a
            href="/browse?type=spaces"
            className="group relative overflow-hidden rounded-2xl shadow hover:shadow-lg transition"
            aria-label="Unique Spaces"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/spaces.jpg"
              alt="Unique Spaces"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Unique Spaces
            </span>
          </a>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-brand-600 py-12 text-cyan-50">
        <h2 className="text-center text-3xl font-bold">
          Become a Host and Earn with Your Space
        </h2>
        <p className="mt-3 text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </p>
        <div className="mt-6 mx-auto max-w-2xl text-center">
          <Link
            href="/list"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-gray-100"
          >
            Start Hosting
          </Link>
        </div>
      </section>
    </div>
  );
}