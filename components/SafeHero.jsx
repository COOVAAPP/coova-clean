// components/SafeHero.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

export default function SafeHero({
  images = [],
  intervalMs = 6000,
  height = "h-[75vh]",
  swipeThreshold = 50, // px required to trigger a swipe
}) {
  const [index, setIndex] = useState(0);

  const countRef = useRef(images.length);
  const timerRef = useRef(null);

  // touch tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDx = useRef(0);
  const isSwiping = useRef(false);

  // keep ref in sync if images array changes
  useEffect(() => {
    countRef.current = images.length;
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  const goTo = useCallback((i) => {
    const count = countRef.current;
    if (!count) return;
    setIndex(((i % count) + count) % count);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // -- Auto-rotate helpers ---------------------------------------------------
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (countRef.current <= 1) return;
    timerRef.current = setInterval(() => {
      // use functional form to avoid stale index
      setIndex((i) => ((i + 1) % countRef.current));
    }, intervalMs);
  }, [intervalMs, stopTimer]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  // -- Keyboard navigation ---------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        stopTimer();
        next();
        startTimer();
      }
      if (e.key === "ArrowLeft") {
        stopTimer();
        prev();
        startTimer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, stopTimer, startTimer]);

  // -- Touch swipe (mobile) --------------------------------------------------
  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchDx.current = 0;
    isSwiping.current = true;
    stopTimer();
  };

  const onTouchMove = (e) => {
    if (!isSwiping.current || !e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    // Only consider mostly-horizontal gestures
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault(); // reduce scroll interference while swiping horizontally
      touchDx.current = dx;
    }
  };

  const onTouchEnd = () => {
    if (!isSwiping.current) return;
    const dx = touchDx.current;
    isSwiping.current = false;
    touchDx.current = 0;

    if (Math.abs(dx) >= swipeThreshold) {
      if (dx < 0) next(); // swipe left → next
      else prev();        // swipe right → prev
    }

    startTimer();
  };

  if (!images.length) return null;

  return (
    <section
      className={`relative w-full overflow-hidden ${height}`}
      aria-roledescription="carousel"
      aria-label="Featured spaces"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides (fade) */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={i === index ? "false" : "true"}
        >
          <Image
            src={src}
            alt={`Hero ${i + 1}`}
            fill
            priority={i === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Overlay for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Headline / subtext (optional; remove if you already render text elsewhere) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto text-center px-4">
          <h1 className="text-white text-3xl sm:text-5xl font-extrabold tracking-tight">
            Find unique spaces.
            <br className="hidden sm:block" />
            Host unforgettable moments.
          </h1>
          <p className="mt-3 sm:mt-4 text-white/90 text-sm sm:text-base max-w-2xl mx-auto">
            COOVA connects creators and hosts—from studios and rooftops to kitchens, cars, and more.
          </p>
        </div>
      </div>

      {/* Dots (clickable + focus rings) */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2"
        role="tablist"
        aria-label="Slide chooser"
      >
        {images.map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              aria-label={`Slide ${i + 1}`}
              tabIndex={0}
              onClick={() => {
                stopTimer();
                setIndex(i);
                startTimer();
              }}
              className={`h-3 w-3 rounded-full transition transform outline-none
                ${active ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"}
                focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
              `}
            />
          );
        })}
      </div>
    </section>
  );
}