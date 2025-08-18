"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
];

export default function RotatingHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const current = IMAGES[index];

  return (
    <section className="relative h-[420px] w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-center bg-cover transition-opacity duration-700"
        style={{ backgroundImage: `url(${current})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Rent Luxury. Share Good Vibes.
          </h1>
          <p className="mt-3 text-white/90">
            Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
          </p>
        </div>
      </div>
    </section>
  );
}