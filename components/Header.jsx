// components/Header.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-wide">COOVA</Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>
          <button
            onClick={() => setOpen(true)}
            className="hover:opacity-80"
          >
            Log In
          </button>
          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile: just a Log In button for now */}
        <button
          className="sm:hidden rounded-md border border-black/10 px-3 py-1.5 text-sm"
          onClick={() => setOpen(true)}
        >
          Log In
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}