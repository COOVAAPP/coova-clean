// components/SafeHero.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SafeHero({
  images = [],
  intervalMs = 4000,
  className = "",
}) {
  // Fallback single image if none provided (replace with a safe public URL if you want)
  const defaults = useMemo(
    () => [
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg4.jpg",,
    ],
    []
  );

  const pics = images.length ? images : defaults;

  // Preload on the client to avoid flashes
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
      if (!hoverRef.current) setIdx((i) => (i + 1) % pics.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [pics.length, intervalMs]);

  const bg = { backgroundImage: `url('${pics[idx]}')` };

  return (
    <section className={`relative w-full overflow-clip ${className}`}>
      {/* The image layer */}
      <div
        className="h-[420px] sm:h-[520px] lg:h-[640px] bg-center bg-cover transition-opacity duration-700 pointer-events-none"
        style={bg}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        aria-label="Welcome to COOVA hero"
      />

      {/* Gradient/overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0 pointer-events-none z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center pointer-events-none z-20">
        <div className="container-page pointer-events-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Discover luxury pools, unique venues, and cars — or become a host and earn with your
            space.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a
              href="/browse"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50 cursor-pointer relative z-30"
            >
              Explore Now
            </a>
            <a
              href="/list/create"
              className="inline-flex items-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50 cursor-pointer relative z-30"
            >
              List Your Space
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}