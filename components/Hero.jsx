// components/Hero.jsx
"use client";
import { useEffect, useState } from "react";

const IMAGES = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!Array.isArray(IMAGES) || IMAGES.length === 0) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % IMAGES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const current = IMAGES[Math.min(Math.max(idx, 0), IMAGES.length - 1)] ?? IMAGES[0];

  return (
    <section className="relative w-full overflow-hidden">
      {/* single layer — no map, no fragments */}
      <div
        className="h-[420px] bg-center bg-cover transition-opacity duration-1000 opacity-100"
        style={{ backgroundImage: `url('${current}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0" />
      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Rent Luxury. Share Good Vibes.
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
          </p>
        </div>
      </div>
    </section>
  );
}