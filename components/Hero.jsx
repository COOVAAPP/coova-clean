// components/Hero.jsx
'use client';
import { useEffect, useState } from 'react';

const IMAGES = [
  'https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg',
  'https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg',
  'https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg',
];

export default function Hero() {
  const safeImages = Array.isArray(IMAGES) ? IMAGES : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(
      () => setIdx((p) => (typeof p === 'number' ? (p + 1) % safeImages.length : 0)),
      8000
    );
    return () => clearInterval(id);
  }, [safeImages.length]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* layered backgrounds */}
      {safeImages.map((src, i) => (
        <div
          key={src ?? i}
          className={`absolute inset-0 bg-center bg-cover transition-opacity duration-700 ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}

      {/* gradient overlay */}
      <div className="relative z-10 bg-gradient-to-b from-black/40 via-black/20 to-black/0 text-white">
        <div className="container-page py-20 sm:py-28">
          <h1 className="text-4xl sm:text-5xl font-bold">Rent Luxury. Share Good Vibes.</h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
          </p>
          {/* Search bar (as you had) */}
          <form action="/browse" className="mt-5 grid max-w-2xl grid-cols-12 gap-2 rounded-full bg-white/95 p-2 shadow-lg backdrop-blur">
            <input
              type="text"
              name="q"
              placeholder="I want… (Pools, Cars, Studio)"
              className="col-span-8 rounded-full px-4 py-2 text-[15px] outline-none"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="col-span-3 rounded-full px-4 py-2 text-[15px] outline-none"
            />
            <button className="col-span-1 rounded-full bg-black text-white">Search</button>
          </form>
        </div>
      </div>
    </section>
  );
}