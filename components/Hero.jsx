// components/Hero.jsx
"use client";

import { useEffect, useState, Suspense } from "react";
import SearchBar from "@/components/SearchBar";

const IMAGES = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % IMAGES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      <div className="relative z-10 container-page py-20 sm:py-28 text-white">
        <h1 className="text-4xl sm:text-5xl font-bold">Rent Luxury. Share Good Vibes.</h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
        </p>

        {/* 🔒 Suspense for useSearchParams in SearchBar */}
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
    </section>
  );
}