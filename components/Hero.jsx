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
    if (IMAGES.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % IMAGES.length), 8000);
    return () => clearInterval(id);
  }, []);

  const src = IMAGES[idx] ?? IMAGES[0];

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover transition-opacity duration-500"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
      <div className="relative z-10 container-page py-20 sm:py-28 text-white">
        <h1 className="text-4xl sm:text-5xl font-bold">Rent Luxury. Share Good Vibes.</h1>
        <p className="mt-3 max-w-2xl font-bold text-cyan-500">
          Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
        </p>
      </div>
    </section>
  );
}