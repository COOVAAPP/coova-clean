// components/Header.jsx
"use client";

/**
 * COOVA Header (full version)
 * - Responsive (desktop + mobile)
 * - Browse / List your space nav
 * - Sign in button opens global AuthModal via "open-auth" event
 * - When signed in: shows avatar (photo or initial), dropdown with Profile / Dashboard / Sign out
 * - Pulls avatar from `profiles.avatar_path` (bucket: avatars) and listens to auth changes
 * - Cyan-500 brand accents, hover to black per your preference
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// If you have a SearchBar component, uncomment this import.
// import SearchBar from "@/components/SearchBar";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Auth/session state
  const [session, setSession] = useState(null);

  // Avatar state (from profiles table)
  const [avatarUrl, setAvatarUrl] = useState(null);

  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Compute next param for auth redirect (where to return after sign in)
  const nextParam = useMemo(() => pathname || "/", [pathname]);

  // Load session and subscribe to changes
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!mounted) return;
      setSession(s || null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Fetch avatar from profiles when session changes
  useEffect(() => {
    (async () => {
      if (!session?.user?.id) {
        setAvatarUrl(null);
        return;
      }
      // get avatar_path from profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_path")
        .eq("id", session.user.id)
        .single();

      if (error || !data?.avatar_path) {
        setAvatarUrl(null);
        return;
      }
      // turn the storage path into a public URL
      const { data: pub } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.avatar_path);

      setAvatarUrl(pub?.publicUrl || null);
    })();
  }, [session]);

  // Open the global AuthModal (mounted in app/layout.js)
  const openAuth = () => {
    // Dispatch an event the modal listens for…
    window.dispatchEvent(
      new CustomEvent("open-auth", { detail: { next: nextParam } })
    );
    // …and mirror state into the URL so refresh keeps the modal open
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "1");
    url.searchParams.set("next", nextParam);
    router.replace(url.pathname + "?" + url.searchParams.toString());
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    setUserMenuOpen(false);
    router.replace("/");
  };

  // Derive initial letter if no avatar
  const email = session?.user?.email || "";
  const initial = email ? email[0].toUpperCase() : "C";

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-4xl font-extrabold tracking-tight text-cyan-500 hover:text-black"
          >
            COOVA
          </Link>
        </div>

        {/* Center: (optional) Search bar */}
        {/* <div className="hidden md:block flex-1 px-6">
          <SearchBar />
        </div> */}

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link className="font-bold hover:text-cyan-500" href="/">
            Browse
          </Link>
          <Link className="font-bold hover:text-cyan-500" href="/list">
            List your space
          </Link>

          {/* Auth area */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-gray-200 hover:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-white">
                    {initial}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white p-2 shadow-xl"
                  role="menu"
                >
                  <Link
                    href="/profile"
                    className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:text-black"
            >
              Sign in
            </button>
          )}
        </nav>

        {/* Mobile right side: hamburger / auth */}
        <div className="flex items-center gap-2 md:hidden">
          {session ? (
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200 hover:ring-gray-300"
              aria-label="Account menu"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
                  {initial}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={openAuth}
              className="rounded-md bg-cyan-500 px-3 py-1 text-sm font-bold text-white hover:text-black"
            >
              Sign in
            </button>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-gray-700"
            >
              <path strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="border-t border-gray-200" />
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              className="block rounded px-3 py-2 font-bold hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/list"
              className="block rounded px-3 py-2 font-bold hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              List your space
            </Link>
          </div>

          <div className="border-t border-gray-200" />

          {/* Mobile account section */}
          <div className="px-4 py-3">
            {session ? (
              <>
                <div className="mb-3 flex items-center gap-3">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-white">
                      {initial}
                    </div>
                  )}
                  <div className="text-sm text-gray-700">{email}</div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-1 w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openAuth();
                }}
                className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white hover:text-black"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click-away overlay for dropdown on desktop */}
      {userMenuOpen && (
        <button
          aria-hidden
          onClick={() => setUserMenuOpen(false)}
          className="fixed inset-0 z-[49] hidden md:block cursor-default"
        />
      )}
    </header>
  );
}