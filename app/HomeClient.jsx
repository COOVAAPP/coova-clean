// app/HomeClient.jsx
"use client";

import Link from "next/link";
import SafeHero from "../components/SafeHero"; // <- using the hero that was working for you

export default function HomeClient() {
  return (
    <main className="min-h-screen flex flex-col gap-12">
      {/* HERO (full bleed) */}
      <SafeHero />

      {/* CATEGORY CARDS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {/* Pools & Venues */}
          <a
            href="/browse?type=pools"
            className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
            aria-label="Pools & Venues"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/categories/pools.jpg"
              alt="Pools & Venues"
              className="h-[240px] w-[320px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Pools & Venues
            </span>
          </a>

          {/* Luxury Cars */}
          <a
            href="/browse?type=cars"
            className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
            aria-label="Luxury Cars"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/categories/cars.jpg"
              alt="Luxury Cars"
              className="h-[240px] w-[320px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Luxury Cars
            </span>
          </a>

          {/* Unique Spaces */}
          <a
            href="/browse?type=spaces"
            className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
            aria-label="Unique Spaces"
          >
            <img
              src="https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/categories/spaces.jpg"
              alt="Unique Spaces"
              className="h-[240px] w-[320px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/40" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-center text-white text-lg font-semibold">
              Unique Spaces
            </span>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-12 text-cyan-50">
        <h2 className="text-center text-3xl font-bold">Become a Host and Earn with Your Space</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </p>
        <div className="mt-6 text-center">
          <Link
            href="/list"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-600 shadow hover:bg-gray-100"
          >
            Start Hosting
          </Link>
        </div>
      </section>
    </main>
  );
}