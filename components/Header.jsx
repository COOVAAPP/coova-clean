// components/Header.jsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-[#9EFCFF] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold tracking-wide">
          COOVA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/browse" className="hover:text-gray-900">
            Browse
          </Link>
          <Link href="/login" className="hover:text-gray-900">
            Login
          </Link>
          <Link
            href="/list"
            className="rounded-full bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 ring-1 ring-black/10 hover:bg-gray-100 md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm font-medium">
            <Link href="/browse" onClick={() => setOpen(false)} className="py-2">
              Browse
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="py-2">
              Login
            </Link>
            <Link
              href="/list"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-brand-500 px-4 py-2 text-center text-white hover:bg-brand-600"
            >
              List Your Space
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}