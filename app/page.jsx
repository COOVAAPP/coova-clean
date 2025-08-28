// app/page.jsx
// app/page.jsx
"use client";

import Link from "next/link";
import SafeHero from "@/components/SafeHero";

export const dynamic = "force-dynamic";

// Replace these with your real public image URLs (Supabase or other HTTPS)
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521747116042-5a810fda9664?q=80&w=1600&auto=format&fit=crop",
];

export default function HomePage() {
  return (
    <main className="min-h-[70vh]">
      {/* Rotating hero (auto-rotate, dots, arrow-key support) */}
      <SafeHero
        images={HERO_IMAGES}
        intervalMs={6000}     // optional: rotation speed
        height="h-[75vh]"     // optional: hero height (e.g., "h-[60vh]" or "h-screen")
      />

      {/* CTAs under the hero */}
      <section className="container-page py-8 text-center">
        <div className="inline-flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="inline-flex items-center rounded-full bg-white text-gray-900 px-5 py-2 font-semibold shadow hover:bg-gray-100 transition"
          >
            Browse
          </Link>
          <Link
            href="/list/create"
            className="inline-flex items-center rounded-full border-2 border-cyan-500 text-cyan-600 px-5 py-2 font-semibold hover:bg-cyan-50 transition"
          >
            List your space
          </Link>
        </div>
      </section>
    </main>
  );
}