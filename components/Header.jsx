"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      {/* Desktop / Tablet */}
      <div className="container-page h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <span className="inline-block h-8 w-8 rounded-full bg-brand-600 text-white grid place-items-center">C</span>
          <span>COOVA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="hover:text-brand-600">Browse</Link>
          <Link href="/login" className="hover:text-brand-600">Login</Link>
          <Link
            href="/list"
            className="btn !py-2 !px-4"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label="Open menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
          onClick={() => setOpen(true)}
        >
          {/* hamburger icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* backdrop */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-lg"
                onClick={() => setOpen(false)}
              >
                <span className="inline-block h-8 w-8 rounded-full bg-brand-600 text-white grid place-items-center">C</span>
                <span>COOVA</span>
              </Link>
              <button
                aria-label="Close"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {/* close icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-4 flex flex-col gap-2">
              <Link
                href="/browse"
                className="px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/login"
                className="px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/list"
                className="mt-2 btn justify-center"
                onClick={() => setOpen(false)}
              >
                List Your Space
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}