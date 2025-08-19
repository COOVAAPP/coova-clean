"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cyan-100 bg-[#9EFCFF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#9EFCFF]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link href="/" className="shrink-0 text-4xl font-extrabold tracking-tight text-white">
            COOVA
          </Link>

          {/* Center: Nav (desktop) */}
          <nav className="mx-auto hidden items-center gap-6 md:flex">
            <Link href="/browse" className="text-sm font-medium text-cyan-900 hover:text-cyan-700">
              Browse
            </Link>
            <Link
              href="/list"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow hover:bg-cyan-50"
            >
              List your space
            </Link>
          </nav>

          {/* Right: Auth */}
          <div className="ml-auto hidden md:flex">
            <button
              onClick={() => setAuthOpen(true)}
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
            >
              Log in / Sign up
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-auto inline-flex items-center rounded-md border border-cyan-300 p-2 text-cyan-800 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {/* three bars */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-cyan-100 bg-[#9EFCFF] px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="/browse" onClick={() => setMobileOpen(false)} className="text-cyan-900">
                Browse
              </Link>
              <Link
                href="/list"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-white px-4 py-2 font-bold text-brand-600 shadow"
              >
                List your space
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setAuthOpen(true);
                }}
                className="rounded-full bg-brand-500 px-4 py-2 font-bold text-white"
              >
                Log in / Sign up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}