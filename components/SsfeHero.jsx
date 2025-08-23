// components/SafeHero.jsx
"use client";

import Link from "next/link";

export default function SafeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div
        className="h-[420px] sm:h-[480px] lg:h-[560px] bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://opnqqloemtaaowfttfas.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg')",
        }}
        aria-label="Welcome to COOVA"
      />

      {/* dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0">
        <div className="container-page h-full">
          <div className="h-full max-w-6xl mx-auto flex items-center px-4 sm:px-6 lg:px-12">
            <div>
              {/* Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
                Welcome to <span className="text-cyan-500">COOVA</span>
              </h1>

              {/* Subhead */}
              <p className="mt-6 max-w-2xl text-white/90 text-lg">
                Discover luxury pools, unique venues, and cars — or become a host
                and earn with your space.
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                <Link
                  href="/browse"
                  className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50 transition"
                >
                  Explore Now
                </Link>

                <Link
                  href="/list"
                  className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50 transition"
                >
                  List Your Space
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}