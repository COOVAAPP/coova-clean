// components/Header.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Adjust paths if yours differ
import AuthModal from "./AuthModal.jsx";
import useRequireAuth from "../lib/useRequireAuth";

export default function Header() {
  const pathname = usePathname();

  // ===== Auth state/hooks =====
  const {
    user,
    requireAuth,      // may be undefined in your current hook — we guard below
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
  } = useRequireAuth?.() ?? {};

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = useCallback(
    (href) => (pathname === href ? "text-white" : "text-white/80"),
    [pathname]
  );

  const openAuth = useCallback(
    (tab = "signin") => {
      if (typeof setAuthTab === "function") setAuthTab(tab);
      if (typeof setAuthOpen === "function") setAuthOpen(true);
    },
    [setAuthOpen, setAuthTab]
  );

  // Safe “List your space” handler:
  // - If your hook exposes requireAuth(cb), we use it
  // - Else: fall back to opening the modal when logged out, or navigate when logged in
  const onListYourSpace = useCallback(async () => {
    try {
      if (typeof requireAuth === "function") {
        await requireAuth(() => {
          window.location.href = "/list/create";
        });
        return;
      }
      if (!user) {
        openAuth("signin");
        return;
      }
      window.location.href = "/list/create";
    } catch (e) {
      console.error("onListYourSpace error:", e);
      // last resort: show auth
      if (!user) openAuth("signin");
    }
  }, [requireAuth, user, openAuth]);

  const authButtonLabel = useMemo(() => (user ? "Dashboard" : "Sign in / Sign up"), [user]);

  return (
    <>
      <header className="sticky top-0 z-[200] pointer-events-auto bg-cyan-500/90 backdrop-blur supports-[backdrop-filter]:bg-cyan-500/70 border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: brand + mobile menu */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 outline-none"
                aria-label="Open navigation"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/" className="font-extrabold tracking-wide text-2xl text-white">
                COOVA
              </Link>
            </div>

            {/* Center nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/browse"
                className={`text-sm font-medium transition hover:text-white ${isActive("/browse")}`}
              >
                Browse
              </Link>

              {/* IMPORTANT: use a button so we can auth-gate */}
              <button
                onClick={onListYourSpace}
                className="cursor-pointer rounded-full border-2 border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                aria-label="List your space"
                type="button"
              >
                List your space
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {!user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => openAuth("signin")}
                    className="cursor-pointer rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                  >
                    {authButtonLabel}
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="cursor-pointer rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  {authButtonLabel}
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
                className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-white/10 ${isActive("/browse")}`}
              >
                Browse
              </Link>

              <button
                onClick={onListYourSpace}
                className="block text-left rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                type="button"
              >
                List your space
              </button>

              {!user ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openAuth("signin")}
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                    type="button"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-white/90"
                    type="button"
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
        open={!!authOpen}
        onClose={() => setAuthOpen?.(false)}
        defaultTab={authTab || "signin"}
      />
    </>
  );
}