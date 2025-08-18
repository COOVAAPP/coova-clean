"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
        sticky top-0 z-40 border-b border-black/10
        bg-[#9EFCFF] supports-[backdrop-filter]:bg-[#9EFCFF]/90
        backdrop-blur
      "
    >
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-wide">COOVA</Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>
          <Link href="/login" className="hover:opacity-80">Login</Link>
          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle Menu"
        >
          <span className="i-lucide-menu h-5 w-5 text-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1">Browse</Link>
            <Link href="/login" className="py-1">Login</Link>
            <Link href="/list" className="py-1">List Your Space</Link>
          </nav>
        </div>
      )}
    </header>
  );
}