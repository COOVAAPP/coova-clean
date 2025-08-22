"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * RotatingHero
 * - Crossfades through an array of images
 * - Pauses on hover
 * - Preloads images to avoid flashes
 */
export default function RotatingHero({
  images = [],
  intervalMs = 4000,
  className = "full-bleed",
  title = "Welcome to COOVA",
  subtitle = "Discover luxury pools, unique venues, and cars — or become a host and earn with your space.",
  ctaPrimary = { href: "/browse", label: "Explore Now" },
  ctaSecondary = { href: "/list", label: "List Your Space" },
}) {
  // Fallback images if none passed in
  const fallback = useMemo(
    () => [
      // Replace these with your Supabase public URLs if you have different ones
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg1.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg2.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg3.jpg",
      "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg4.jpg",
    ],
    []
  );

  const pics = images.length ? images : fallback;

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

  return (
    <section
      className={`relative overflow-hidden rounded-2xl bg-brand-600 text-white ${className}`}
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      aria-label="Hero"
    >
      {/* Images (stacked & crossfading) */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px]">
        {pics.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
            fetchpriority={i === 0 ? "high" : "auto"}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Copy + CTAs */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-white/90">{subtitle}</p>

            <div className="mt-6 flex gap-3">
              <a
                href={ctaPrimary.href}
                className="rounded-full bg-white px-5 py-2 font-semibold text-brand-600 hover:bg-gray-100"
              >
                {ctaPrimary.label}
              </a>
              <a
                href={ctaSecondary.href}
                className="rounded-full border border-white/70 px-5 py-2 font-semibold text-white hover:bg-white/10"
              >
                {ctaSecondary.label}
              </a>
            </div>
          </div>
        </div>

        {/* Soft bottom fade so the next section feels connected */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-600/40 to-transparent" />
      </div>
    </section>
  );
}