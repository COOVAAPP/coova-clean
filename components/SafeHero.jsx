"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

export default function SafeHero() {
  const images = [
    "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg1.jpg",
    "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg2.jpg",
    "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg3.jpg",
    "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/categories/bg4.jpg",
  ];

  const intervalMs = 4000;
  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

  // preload images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  // rotate images
  useEffect(() => {
    const t = setInterval(() => {
      if (!hoverRef.current) {
        setIdx((i) => (i + 1) % images.length);
      }
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative w-full h-[480px] overflow-hidden">
      {/* Rotating background */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Hero ${i}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white">
          Welcome to{" "}
          <span className="text-cyan-500 drop-shadow-lg">COOVA</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-200">
          Discover luxury pools, unique venues, and cars — or become a host and
          earn with your space.
        </p>

        <div className="mt-6 flex gap-4">
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
    </section>
  );
}