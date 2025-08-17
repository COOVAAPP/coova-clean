// app/page.jsx
"use client";

import Link from "next/link";
// app/page.jsx
import Hero from "@/components/Hero";
import CategoryCardGrid from "@/components/CategoryCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero with rotating backgrounds + search */}
      <Hero />

      {/* Category Cards (DB-driven) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>
        <CategoryCardGrid />
      </section>
      

      {/* CTA */}
      <section className="bg-brand-600 py-12 text-white">
        <h2 className="text-center text-3xl font-bold">Become a Host and Earn with Your Space</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center">
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