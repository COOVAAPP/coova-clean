"use client";

import { useEffect, useState } from "react";

const BACKGROUNDS = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % BACKGROUNDS.length);
    }, 8000); // 8 seconds per image
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[420px] w-full overflow-hidden">
      {/* Slides */}
      {BACKGROUNDS.map((url, i) => (
        <div
          key={url}
          className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${url})` }}
        />
      ))}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Copy + Search */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          Rent Luxury. <span className="text-brand-500">Share Good Vibes.</span>
        </h1>
        <p className="mt-3 max-w-xl text-cyan-500">
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