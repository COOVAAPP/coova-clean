"use client";

import Link from "next/link";

export default function HomeClient() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* HERO (optional) */}
      {/* <Hero /> */}

      {/* CATEGORY CARDS (your existing markup is fine) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>

        {/* …your existing card grid… */}
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-12 text-cyan-50">
        <h2 className="text-center text-3xl font-bold">Become a Host and Earn with Your Space</h2>
        <div className="mx-auto mt-3 max-w-2xl text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </div>
        <div className="mt-6 text-center">
          <Link href="/list" className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-600 shadow hover:bg-gray-100">
            Start Hosting
          </Link>
        </div>
      </section>
    </main>
  );
}