"use client";

import { useEffect, useState } from "react";

export default function RotatingHero({ images, interval = 8000, children }) {
  // two-layer crossfade
  const [showA, setShowA] = useState(true);
  const [aIdx, setAIdx] = useState(0);
  const [bIdx, setBIdx] = useState(images.length > 1 ? 1 : 0);

  useEffect(() => {
    const id = setInterval(() => {
      if (showA) {
        // prepare B with next, then fade to B
        setBIdx((prev) => (prev + 1) % images.length);
      } else {
        // prepare A with next, then fade to A
        setAIdx((prev) => (prev + 1) % images.length);
      }
      setShowA((s) => !s);
    }, interval);
    return () => clearInterval(id);
  }, [showA, images.length, interval]);

  return (
    <section className="relative h-[420px] w-full overflow-hidden">
      {/* Layer A */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${showA ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: `url(${images[aIdx]})` }}
      />
      {/* Layer B */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${showA ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${images[bIdx]})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}