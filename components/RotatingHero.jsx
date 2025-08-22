"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function RotatingHero({
  images,
  intervalMs = 4000,
  className = "",
}) {
  // Default to your Supabase hero images if none are provided
  const fallback = useMemo(
    () => [
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg2.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg3.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg4.jpg",
    ],
    []
  );

  const pics = Array.isArray(images) && images.length ? images : fallback;

  // Preload to avoid flashes
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

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      aria-label="Welcome to COOVA"
    >
      {/* full-bleed image layer */}
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100">
          {pics.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`h-[420px] w-full object-cover transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
              fetchPriority={i === idx ? "high" : "auto"}
              decoding="async"
            />
          ))}
          {/* gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0" />
        </div>

        {/* headline + buttons */}
        <div className="absolute inset-0 flex items-center">
          <div className="container-page">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Welcome to <span className="text-cyan-500">COOVA</span>
            </h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Discover luxury pools, unique venues, and cars — or become a host and
              earn with your space.
            </p>

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
      </div>
    </section>
  );
}