"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess ?? null);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setShowAuth(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold tracking-wide">COOVA</Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>

          {!session ? (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="hover:opacity-80"
            >
              Log In / Sign Up
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="hover:opacity-80"
            >
              Logout
            </button>
          )}

          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-black"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle Menu"
        >
          {/* simple hamburger icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1" onClick={() => setMobileOpen(false)}>Browse</Link>

            {!session ? (
              <button
                type="button"
                className="py-1 text-left"
                onClick={() => {
                  setMobileOpen(false);
                  setShowAuth(true);
                }}
              >
                Log In / Sign Up
              </button>
            ) : (
              <button
                type="button"
                className="py-1 text-left"
                onClick={async () => {
                  setMobileOpen(false);
                  await handleLogout();
                }}
              >
                Logout
              </button>
            )}

            <Link href="/list" className="py-1" onClick={() => setMobileOpen(false)}>
              List Your Space
            </Link>
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </header>
  );
}