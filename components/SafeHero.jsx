"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * SafeHero
 * - Full-bleed hero that can optionally rotate through an array of image URLs
 * - COOVA word is cyan, buttons are white with cyan text/border
 * - Pauses rotation while user hovers the hero
 */
export default function SafeHero({
  images = [],          // optional: array of image URLs to rotate
  intervalMs = 4000,    // how long each image shows
  className = "",       // extra classes for the outer <section>
}) {
  // Fallback single image if none provided (replace with your Supabase URL if you like)
  const defaults = useMemo(
    () => [
      // 👉 Replace these four with your own Supabase public URLs if desired
      "https://opnqqloemtaaowfttaf.s.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg",
      "https://opnqqloemtaaowfttaf.s.supabase.co/storage/v1/object/public/Public/Public/bg2.jpg",
      "https://opnqqloemtaaowfttaf.s.supabase.co/storage/v1/object/public/Public/Public/bg3.jpg",
      "https://opnqqloemtaaowfttaf.s.supabase.co/storage/v1/object/public/Public/Public/bg4.jpg",
    ],
    []
  );

  // Use provided images if present, otherwise the defaults above
  const pics = images.length ? images : defaults;

  // Preload images to avoid flashes
  useEffect(() => {
    pics.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [pics]);

  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

  // Rotate images
  useEffect(() => {
    const t = setInterval(() => {
      if (!hoverRef.current) {
        setIdx((i) => (i + 1) % pics.length);
      }
    }, intervalMs);
    return () => clearInterval(t);
  }, [pics.length, intervalMs]);

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="h-[420px] sm:h-[480px] lg:h-[520px] bg-center bg-cover transition-opacity duration-700"
        style={{ backgroundImage: `url("${pics[idx]}")` }}
        aria-hidden="true"
      />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0 pointer-events-none" />
      <div className="absolute inset-0 bg-black/25" />

      {/* CONTENT */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>

          <p className="mt-2 max-w-2xl text-white/90">
            Discover luxury pools, unique venues, and cars — or become a host
            and earn with your space.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <a
              href="/browse"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
            >
              Explore Now
            </a>

            <a
              href="/list"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
            >
              List Your Space
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}