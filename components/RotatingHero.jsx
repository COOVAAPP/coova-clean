// components/RotatingHero.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function RotatingHero({
  images = [],
  intervalMs = 4000,
  className = "full-bleed",
}) {
  // Fallback images if none provided (update to your real paths)
  const fallbacks = useMemo(
    () => [
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg1.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg2.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg3.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg4.jpg",
    ],
    []
  );

  const pics = images.length ? images : fallbacks;

  // Preload
  useEffect(() => {
    pics.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [pics]);

  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!hoverRef.current) {
        setIdx((i) => (i + 1) % pics.length);
      }
    }, intervalMs);
    return () => clearInterval(t);
  }, [pics.length, intervalMs]);

  const current = pics[idx];
  const next = pics[(idx + 1) % pics.length];

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      {/* Two layers for crossfade */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url('${current}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-700 opacity-0"
        key={next} // force repaint when "next" changes
        style={{
          backgroundImage: `url('${next}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Darken for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/0" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 py-20 lg:py-32 text-white">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Welcome to <span className="text-cyan-500">COOVA</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-white/90 max-w-2xl">
          Discover luxury pools, unique venues, and cars — or become a host and
          earn with your space.
        </p>

        {/* CTA buttons (outlined, cyan text) */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          <Link
            href="/browse"
            className="inline-flex items-center rounded-full border-2 border-cyan-500 px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
          >
            Explore Now
          </Link>
          <Link
            href="/list"
            className="inline-flex items-center rounded-full border-2 border-cyan-500 px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
          >
            List Your Space
          </Link>
        </div>
      </div>

      {/* Height controller */}
      <div className="invisible h-[420px] sm:h-[480px]" />
    </section>
  );
}