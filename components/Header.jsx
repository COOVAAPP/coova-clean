// components/Header.jsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="container-page mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-gray-900"
          onClick={close}
        >
          COOVA
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-gray-700 transition hover:text-brand-600"
          >
            Home
          </Link>

          <Link
            href="/browse"
            className="text-gray-700 transition hover:text-brand-600"
          >
            Browse
          </Link>

          <Link
            href="/login"
            className="text-gray-700 transition hover:text-brand-600"
          >
            Login
          </Link>

          <Link
            href="/list"
            className="rounded-md bg-brand-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={toggle}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {/* Hamburger / X */}
          <svg
            className={`h-6 w-6 ${open ? "hidden" : "block"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            className={`h-6 w-6 ${open ? "block" : "hidden"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`md:hidden ${open ? "block" : "hidden"} border-t border-gray-200 bg-white`}
      >
        <nav className="space-y-1 px-4 py-4">
          <Link
            href="/"
            onClick={close}
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
          >
            Home
          </Link>

          <Link
            href="/browse"
            onClick={close}
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
          >
            Browse
          </Link>

          <Link
            href="/login"
            onClick={close}
            className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/list"
            onClick={close}
            className="block rounded-md bg-brand-600 px-3 py-2 text-base font-semibold text-white hover:bg-brand-700"
          >
            List Your Space
          </Link>
        </nav>
      </div>
    </header>
  );
}