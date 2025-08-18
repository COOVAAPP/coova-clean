"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load the modal on the client only (prevents SSR build errors)
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

export default function Header() {
  const [open, setOpen] = useState(false);       // mobile menu
  const [showAuth, setShowAuth] = useState(false); // auth modal

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-5xl font-bold tracking-wide text-black">
          COOVA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>

          {/* Opens the modal */}
          <button
            onClick={() => setShowAuth(true)}
            className="hover:opacity-80"
            aria-label="Log in or Sign up"
          >
            Log In / Sign Up
          </button>

          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-black">
          <button onClick={() => setOpen((v) => !v)} aria-label="Toggle Menu">
            {/* Lucide menu icon substitute */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1">Browse</Link>
            <button className="py-1 text-left" onClick={() => { setShowAuth(true); setOpen(false); }}>
              Log In / Sign Up
            </button>
            <Link href="/list" className="py-1">List Your Space</Link>
          </nav>
        </div>
      )}

      {/* Auth Modal (client-only) */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </header>
  );
}