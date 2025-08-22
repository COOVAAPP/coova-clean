"use client";

import Link from "next/link";

export default function SafeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div
        className="h-[420px] bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg')",
        }}
      />

      {/* DARK GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>

          <p className="mt-2 max-w-2xl text-white/90">
            Discover luxury pools, unique venues, and cars — or become a host and earn with your
            space.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
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