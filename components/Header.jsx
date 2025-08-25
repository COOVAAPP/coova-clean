// components/Header.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthModal from "./AuthModal.jsx";
import useRequireAuth from "../lib/useRequireAuth";

export default function Header() {
  const pathname = usePathname();

  // ===== Auth modal state =====
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const [authReturnTo, setAuthReturnTo] = useState("/");

  // ===== Auth helpers =====
  const { user, requireAuth, signOut } = useRequireAuth?.() || {};

  // ===== UI state =====
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = useCallback(
    (href) => (pathname === href ? "text-white" : "text-white/80"),
    [pathname]
  );

  const openAuth = useCallback((tab = "signin", returnTo = "/") => {
    setAuthTab(tab);
    setAuthReturnTo(returnTo);
    setAuthOpen(true);
  }, []);

  const onListYourSpace = useCallback(async () => {
    const next = "/list/create";

    if (typeof requireAuth === "function") {
      await requireAuth(() => {
        window.location.href = next;
      }, "signup");
    } else {
      // fallback: just open modal
      setAuthTab("signup");
      setAuthReturnTo(next);
      setAuthOpen(true);
    }
  }, [requireAuth]);

  const authButtonLabel = user ? "Account" : "Sign in / Sign up";

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-cyan-500/90 backdrop-blur supports-[backdrop-filter]:bg-cyan-500/70 border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Brand + mobile menu */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 outline-none"
                aria-label="Open navigation"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link
                href="/"
                className="font-extrabold tracking-wide text-2xl text-white"
              >
                COOVA
              </Link>
            </div>

            {/* Center: primary nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/browse"
                className={`text-sm font-medium transition hover:text-white ${isActive(
                  "/browse"
                )}`}
              >
                Browse
              </Link>

              <button
                onClick={onListYourSpace}
                className="rounded-full border-2 border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                aria-label="List your space"
              >
                List your space
              </button>
            </nav>

            {/* Right: auth / dashboard */}
            <div className="flex items-center gap-3">
              {!user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => openAuth("signin", pathname || "/")}
                    className="rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    {authButtonLabel}
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-cyan-600/90 backdrop-blur">
            <div className="mx-auto w-full max-w-7xl px-4 py-3 flex flex-col gap-2">
              <Link
                href="/browse"
                className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-white/10 ${isActive(
                  "/browse"
                )}`}
              >
                Browse
              </Link>

              <button
                onClick={onListYourSpace}
                className="block text-left rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
              >
                List your space
              </button>

              {!user ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openAuth("signin", pathname || "/")}
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuth("signup", pathname || "/")}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-white/90"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="mt-1 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
        returnTo={authReturnTo}
      />
    </>
  );
}