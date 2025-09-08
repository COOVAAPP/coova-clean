// components/Header.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { requireAgeVerified } from "@/lib/ageGate";

export default function Header() {
  const pathname = usePathname();

  // ── Local state ───────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Keep a light session awareness (to tweak button labels, etc.)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setUser(data?.session?.user ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  // Helper to style active link
  const isActive = useCallback(
    (href) => (pathname === href ? "text-white" : "text-white/80"),
    [pathname]
  );

  // ── Actions ───────────────────────────────────────────────────
  // Open Auth (signin/signup) but require age verification first
  const openAuth = useCallback(async (tab = "signin") => {
    const ok = await requireAgeVerified(() => {
      // optional “after-verify” hook, but we’ll open either way below
    });
    if (ok) window.__COOVA_OPEN_AUTH__?.(tab);
  }, []);

  // “List your space” CTA: verify age → if no user, open signin → else go
  const onListYourSpace = useCallback(async () => {
    const ok = await requireAgeVerified();
    if (!ok) return;

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) {
      window.__COOVA_OPEN_AUTH__?.("signin");
      return;
    }
    window.location.href = "/list/create";
  }, []);

  const authButtonLabel = useMemo(
    () => (user ? "Account" : "Sign in / Sign up"),
    [user]
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <header className="sticky top-0 z-40 bg-cyan-500/90 backdrop-blur supports-[backdrop-filter]:bg-cyan-500/70 border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Brand + mobile toggle */}
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

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/browse"
                className={`text-sm font-medium transition hover:text-white ${isActive("/browse")}`}
              >
                Browse
              </Link>

              <button
                type="button"
                onClick={onListYourSpace}
                className="rounded-full border-2 border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="List your space"
              >
                List your space
              </button>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {!user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => openAuth("signin")}
                    className="rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition cursor-pointer"
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
                className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-white/10 ${isActive("/browse")}`}
              >
                Browse
              </Link>

              <button
                type="button"
                onClick={onListYourSpace}
                className="block text-left rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                List your space
              </button>

              {!user ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openAuth("signin")}
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20 cursor-pointer"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuth("signup")}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-white/90 cursor-pointer"
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
    </>
  );
}