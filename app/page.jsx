// app/page.jsx
// app/page.jsx
"use client";

import Link from "next/link";
import SafeHero from "@/components/SafeHero";

export const dynamic = "force-dynamic";

// Replace these with your real public image URLs (Supabase or other HTTPS)
const HERO_IMAGES = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg4.jpg",
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