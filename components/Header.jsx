// components/Header.jsx
"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AuthModal from "./AuthModal.jsx";
// If you use aliases, change to: import useRequireAuth from "@/lib/useRequireAuth";
import useRequireAuth from "../lib/useRequireAuth";

export default function Header() {
  const pathname = usePathname();

  /**
   * useRequireAuth is assumed to expose:
   *   - user (or null)
   *   - requireAuth(cb, defaultTab?)  // opens auth if not logged in; otherwise runs cb
   *   - authOpen, setAuthOpen
   *   - authTab?, setAuthTab? (optional)
   */
  const {
    user,
    requireAuth,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
  } = useRequireAuth();

  const openAuth = useCallback(
    (tab = "signin") => {
      // Support hooks that expose setAuthTab; if not present, we just open.
      if (typeof setAuthTab === "function") setAuthTab(tab);
      setAuthOpen(true);
    },
    [setAuthOpen, setAuthTab]
  );

  const goToCreateListing = useCallback(async () => {
    await requireAuth(() => {
      window.location.href = "/list/create";
    }, "signup");
  }, [requireAuth]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cyan-600/30 bg-cyan-500/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:h-16 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wide text-white"
            aria-label="COOVA Home"
          >
            COOVA
          </Link>

          {/* Right nav */}
          <nav className="flex items-center gap-3">
            <Link
              href="/browse"
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-cyan-600/30 hover:text-white"
              aria-label="Browse"
            >
              Browse
            </Link>

            <button
              type="button"
              onClick={goToCreateListing}
              className="rounded-full border-2 border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              aria-label="List your space"
            >
              List your space
            </button>

            {/* Auth control */}
            {!user && (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-600 shadow hover:bg-cyan-50"
                aria-label="Sign in or Sign up"
              >
                Sign in / Sign up
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mount the Auth modal here (remove if you already mount it globally) */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab ?? "signin"}
      />
    </>
  );
}// components/Header.jsx
"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import AuthModal from "./AuthModal.jsx";
import useRequireAuth from "../lib/useRequireAuth";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    requireAuth,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
  } = useRequireAuth();

  const openAuth = useCallback(
    (tab = "signin") => {
      setAuthTab?.(tab);
      setAuthOpen(true);
    },
    [setAuthOpen, setAuthTab]
  );

  const goToCreateListing = useCallback(async () => {
    await requireAuth(() => {
      router.push("/list/create");
    }, "signup");
  }, [requireAuth, router]);

  // Avatar state (dropdown)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Derive avatar text / image
  const profileImageUrl = useMemo(() => {
    // common places people store this in Supabase
    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture || // some OAuth providers
      null
    );
  }, [user]);

  const displayLetter = useMemo(() => {
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      "";
    return name ? name.trim().charAt(0).toUpperCase() : "U";
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setMenuOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cyan-600/30 bg-cyan-500/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:h-16 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wide text-white"
            aria-label="COOVA Home"
          >
            COOVA
          </Link>

          {/* Right nav */}
          <nav className="flex items-center gap-3">
            <Link
              href="/browse"
              className="rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-cyan-600/30 hover:text-white"
              aria-label="Browse"
            >
              Browse
            </Link>

            <button
              type="button"
              onClick={goToCreateListing}
              className="rounded-full border-2 border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              aria-label="List your space"
            >
              List your space
            </button>

            {/* Auth controls */}
            {!user ? (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-cyan-600 shadow hover:bg-cyan-50"
                aria-label="Sign in or Sign up"
              >
                Sign in / Sign up
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                {/* Avatar Button */}
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-cyan-500 ring-2 ring-white/70 shadow"
                  title={user.email ?? "Account"}
                >
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-extrabold text-white">
                      {displayLetter}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.user_metadata?.full_name ||
                          user?.user_metadata?.name ||
                          user?.email}
                      </p>
                      {user?.email && (
                        <p className="mt-0.5 text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </div>

                    <div className="border-t py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Single global AuthModal mount */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab ?? "signin"}
      />
    </>
  );
}