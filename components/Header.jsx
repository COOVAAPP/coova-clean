// components/Header.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // auth + ui state
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState("default"); // "default" | "list"
  const [mobileOpen, setMobileOpen] = useState(false);

  // load session on mount, and subscribe to changes
  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      setUser(session?.user ?? null);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription?.unsubscribe();
    };
  }, []);

  // sign out
  async function handleSignOut() {
    await supabase.auth.signOut();
    // if you want a hard refresh to ensure UI resets:
    router.refresh();
  }

  // click “List Your Space”
  async function handleListClick() {
    if (!user) {
      setAuthIntent("list");
      setAuthOpen(true);
      return;
    }
    router.push("/list");
  }

  // click “Sign in”
  function handleSignInClick() {
    setAuthIntent("default");
    setAuthOpen(true);
  }

  // close modal
  function closeAuth() {
    setAuthOpen(false);
  }

  // simple active link styles
  const navLink = (href) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === href ? "bg-black/10 text-black" : "text-gray-800 hover:bg-black/10"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-[#9EFCFF]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="font-extrabold text-xl tracking-tight">
            COOVA
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-2 md:flex">
            <Link href="/browse" className={navLink("/browse")}>
              Browse
            </Link>

            {/* List your space (requires auth) */}
            <button
              onClick={handleListClick}
              className="px-3 py-2 rounded-full text-sm font-semibold bg-black text-white hover:opacity-90"
            >
              List Your Space
            </button>

            {/* Auth buttons */}
            {user ? (
              <>
                <span className="px-2 text-sm text-gray-700 hidden sm:inline">
                  {user.email ?? "Signed in"}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-black/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={handleSignInClick}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-black/10"
              >
                Sign in
              </button>
            )}
          </nav>

          {/* Mobile: menu button */}
          <button
            className="ml-auto inline-flex items-center justify-center rounded-md border border-gray-400 p-2 text-gray-800 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {/* simple burger icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <div className="px-4 py-3">
              <Link
                href="/browse"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-black/10"
                onClick={() => setMobileOpen(false)}
              >
                Browse
              </Link>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleListClick();
                }}
                className="mt-1 block w-full rounded-full bg-black px-3 py-2 text-left text-base font-semibold text-white hover:opacity-90"
              >
                List Your Space
              </button>

              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="mt-1 block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-800 hover:bg-black/10"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignInClick();
                  }}
                  className="mt-1 block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-800 hover:bg-black/10"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth modal */}
      <AuthModal
        open={authOpen}
        onClose={closeAuth}
        intent={authIntent} // "default" or "list" -> AuthModal uses this to redirect after login
      />
    </>
  );
}