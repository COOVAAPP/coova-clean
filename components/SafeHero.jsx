"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function SafeHero({
  images = [],
  intervalMs = 5000,
  // editable copy
  headline = "Find unique spaces.",
  subline = "Host unforgettable moments.",
  kicker  = "COOVA connects creators and hosts — from studios and rooftops to kitchens, cars, and more."
}) {
  const [i, setI] = useState(0);
  const timer = useRef(null);

  // auto-rotate
  useEffect(() => {
    stop();
    timer.current = setInterval(() => {
      setI((n) => (n + 1) % images.length);
    }, intervalMs);
    return stop;
  }, [images.length, intervalMs]);

  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }
  function go(n) {
    setI((n + images.length) % images.length);
  }

  // keyboard ← →
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "ArrowRight") go(i + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i]);

  return (
    <section className="relative isolate h-[60vh] min-h-[420px] w-full overflow-hidden rounded-none">
      {/* slides */}
      {images.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={idx !== i}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={idx === i}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />

      {/* text content */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center">
        <p className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide">COOVA</p>
        <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow">
          {headline}
          <br className="hidden sm:block" />
          <span className="block">{subline}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-white/80 text-sm sm:text-base">
          {kicker}
        </p>
      </div>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              onMouseEnter={stop}
              onMouseLeave={() => {
                if (!timer.current) {
                  timer.current = setInterval(() => {
                    setI((n) => (n + 1) % images.length);
                  }, intervalMs);
                }
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === i ? "bg-white shadow" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}