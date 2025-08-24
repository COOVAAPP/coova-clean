"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SafeHero({
  images = [],
  intervalMs = 4000, // rotate every 4s
}) {
  // Fallbacks (only used if you don't pass `images`)
  const defaults = useMemo(
    () => [
          "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
          "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
          "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
          "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg4.jpg",
    ],
    []
  );

  const pics = images.length ? images : defaults;

  // Preload so the first swap doesn't flash
  useEffect(() => {
    pics.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [pics]);

  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

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
      {/* Fixed-height HERO BAND (adjust numbers if you want it taller/shorter) */}
      <div
        className="relative h-[360px] sm:h-[420px] md:h-[460px] lg:h-[520px] w-full overflow-hidden"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        {/* Actual image that fills the band */}
        <img
          src={pics[idx]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          // if an image fails to load, advance to the next one
          onError={() => setIdx((i) => (i + 1) % pics.length)}
          fetchpriority="high"
        />

        {/* Dark gradient for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/20" />

        {/* Foreground content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="px-4 md:px-8 w-full">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
                Welcome to <span className="text-cyan-500">COOVA</span>
              </h1>
              <p className="mt-2 max-w-xl text-white/90">
                Discover luxury pools, unique venues, and cars — or become a
                host and earn with your space.
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
      </div>
    </section>
  );
}