"use client";

import Link from "next/link";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const [open, setOpen] = useState(false);       // mobile menu
  const [authOpen, setAuthOpen] = useState(false); // auth modal
  const [intent, setIntent] = useState(null);
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 supports-[backdrop-filter]:bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-wide">COOVA</Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>

          {/* Open modal instead of /login */}
          <button onClick={() => { setIntent(null); setAuthOpen(true); }} className="hover:opacity-80">
            Login
          </button>

          {/* Open modal for Sign Up */}
          <button
            onClick={() => { setIntent("/list"); setAuthOpen(true)}}
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-white bg-[#13D4D4]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Menu"
        >
          <span className="i-lucide-menu h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1">Browse</Link>
            <button className="py-1 text-left" onClick={() => { setIntent(null); setAuthOpen(true); }}>
              Login
            </button>
            <button className="py-1 text-left" onClick={() => { setIntent("/list"); setAuthOpen(true); }}>
              List Your Space
            </button>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} intent={intent} />
    </header>
  );
}