// app/page.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521747116042-5a810fda9664?q=80&w=1600&auto=format&fit=crop",
];

export default function HomePage() {
  const [index, setIndex] = useState(0);

  // auto rotate every 6s
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-[70vh]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background with fade */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((url, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative container-page h-[52vh] sm:h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Find unique spaces. <br className="hidden sm:block" />
              Host unforgettable moments.
            </h1>
            <p className="mt-3 sm:mt-4 text-white/90 text-sm sm:text-base">
              COOVA connects creators and hosts—from studios and rooftops to
              kitchens, cars, and more.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center rounded-full bg-white text-gray-900 px-5 py-2 font-semibold shadow hover:bg-gray-100 transition"
              >
                Browse
              </Link>
              <Link
                href="/list/create"
                className="inline-flex items-center rounded-full border-2 border-white/80 text-white px-5 py-2 font-semibold hover:bg-white/10 transition"
              >
                List your space
              </Link>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full transition ${
                  i === index
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}