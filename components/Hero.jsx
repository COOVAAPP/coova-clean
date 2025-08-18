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
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % IMAGES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Backgrounds */}
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
       
        {/* Search Bar */}
        <form
          action="/browse"
          className="mt-5 grid max-w-2xl grid-cols-12 gap-2 rounded-full bg-white/95 p-2 shadow-lg backdrop-blur"
        >
          <input
            type="text"
            name="q"
            placeholder="I want… (Pools, Cars, Studio)"
            className="col-span-8 rounded-full px-4 py-2 text-[15px] outline-none"
          />
          <input
            type="text"
            name="loc"
            placeholder="Location"
            className="col-span-3 rounded-full px-4 py-2 text-[15px] outline-none"
          />
          <button
            type="submit"
            className="col-span-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}