// components/SafeHero.jsx
"use client";

import Link from "next/link";

export default function SafeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div
        className="h-[420px] sm:h-[420px] md:h-[520px] lg:h-[560px] bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg')",
        }}
        aria-label="Hero background"
      />

      {/* Dark gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/90 max-w-2xl">
            Discover luxury pools, unique venues, and cars — or become a host
            and earn with your space.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <Link
              href="/browse"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
            >
              Explore Now
            </Link>

            <Link
              href="/list"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
            >
              List Your Space
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}