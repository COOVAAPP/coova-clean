"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SafeHero({
  images = [],
  intervalMs = 4000, // time per slide
}) {
  // Fallbacks if none passed (won't be used if you pass images via props)
  const defaults = useMemo(
    () => [
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg1.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg2.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg3.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg4.jpg",
    ],
    []
  );

  const pics = images.length ? images : defaults;

  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

  // Preload all images to prevent flashes
  useEffect(() => {
    pics.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [pics]);

  // Rotate images
  useEffect(() => {
    const id = setInterval(() => {
      if (!hoverRef.current) {
        setIdx((i) => (i + 1) % pics.length);
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [pics, intervalMs]);

  return (
    <section className="relative w-full">
      {/* Background that fills the hero band */}
      <div
        className="relative w-full bg-center bg-cover transition-[background-image] duration-700"
        style={{ backgroundImage: `url('${pics[idx]}')` }}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        {/* Set the HERO BAND HEIGHT here (not full screen) */}
        <div className="h-[360px] sm:h-[420px] md:h-[460px] lg:h-[520px]" />
        {/* Dark gradient overlay for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/20" />
      </div>

      {/* Foreground content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-4 md:px-8 w-full">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
              Welcome to <span className="text-cyan-500">COOVA</span>
            </h1>
            <p className="mt-2 max-w-xl text-white/90">
              Discover luxury pools, unique venues, and cars — or become a host
              and earn with your space.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
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
      </div>
    </section>
  );
}