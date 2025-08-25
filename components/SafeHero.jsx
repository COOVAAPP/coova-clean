// components/SafeHero.jsx
"use client";

import Link from "next/link";
import AuthModal from "./AuthModal.jsx";
// If you use path aliases, you can switch this to "@/lib/useRequireAuth"
import useRequireAuth from "../lib/useRequireAuth";

export default function SafeHero({
  // You can pass a custom image; we fall back to your Supabase hero image
  imageUrl = "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/Public/bg1.jpg",
}) {
  const { requireAuth, authOpen, setAuthOpen, authTab } = useRequireAuth();

  const handleListYourSpace = async () => {
    // If authed -> go to create listing
    // If not -> open AuthModal on the "signup" tab
    await requireAuth(() => {
      window.location.href = "/list/create";
    }, "signup");
  };

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      <div
        className="h-[420px] sm:h-[480px] lg:h-[520px] bg-center bg-cover"
        style={{ backgroundImage: `url("${imageUrl}")` }}
        aria-hidden="true"
      />

      {/* Dark gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container-page mx-auto w-full max-w-6xl px-4 lg:px-8 text-white">
          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome to <span className="text-cyan-500">COOVA</span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg leading-8 text-white/90 max-w-2xl">
            Discover luxury pools, unique venues, and cars — or become a host and
            earn with your space.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-start">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
              aria-label="Explore Now"
            >
              Explore Now
            </Link>

            <button
              type="button"
              onClick={handleListYourSpace}
              className="inline-flex items-center justify-center rounded-full border-2 border-cyan-500 bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-cyan-50"
              aria-label="List Your Space"
            >
              List Your Space
            </button>
          </div>
        </div>
      </div>

      {/* Auth modal (mounted once here; remove if you already mount it in layout/header) */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </section>
  );
}