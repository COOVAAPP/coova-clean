// components/Hero.jsx
"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-cyan-100 max-w-2xl mx-auto">
            Discover luxury pools, unique venues, and cars — or become a host and earn with your space.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-white shadow hover:bg-gray-100 transition"
            >
              Explore Now
            </Link>
            <Link
              href="/list"
              className="rounded-full bg-cyan-500 px-6 py-3 font-semibold text-white shadow hover:bg-cyan-600 transition"
            >
              List Your Space
            </Link>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute top-0 left-1/2 -translate-x-1/2 opacity-20"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" />
        </svg>
      </div>
    </section>
  );
}