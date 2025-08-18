// components/Header.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import LoginModal from "@/components/LoginModal";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header
        className="
          sticky top-0 z-40 border-b border-black/10
          bg-[#9EFCFF]/90 supports-[backdrop-filter]:bg-[#9EFCFF]/90
          backdrop-blur
        "
      >
        <div className="container-page h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-4xl font-bold text-white tracking-wide">
            COOVA
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/browse" className="hover:opacity-80">
              Browse
            </Link>

            {/* Login opens modal */}
            <Link
              href="/login"
              className="hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                setLoginOpen(true);
              }}
            >
              Login/Signup
            </Link>

            <Link
              href="/list"
              className="
                rounded-full bg-black text-white px-4 py-2 text-sm
                hover:opacity-90
              "
            >
              List Your Space
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle Menu"
            onClick={() => setOpenMenu((v) => !v)}
            className="
              sm:hidden inline-flex items-center justify-center
              h-9 w-9 rounded-md border border-black/10 text-black
              hover:bg-black/5
            "
          >
            {openMenu ? (
              // Close icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {openMenu && (
          <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
            <nav className="container-page py-3 flex flex-col gap-2 text-sm">
              <Link href="/browse" className="py-1" onClick={() => setOpenMenu(false)}>
                Browse
              </Link>
              <Link
                href="/login"
                className="py-1"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenMenu(false);
                  setLoginOpen(true);
                }}
              >
                Login
              </Link>
              <Link
                href="/list"
                className="py-1"
                onClick={() => setOpenMenu(false)}
              >
                List Your Space
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* LOGIN MODAL (Phone + Email tabs) */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}