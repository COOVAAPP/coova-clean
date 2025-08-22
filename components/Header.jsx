// components/Header.jsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // auth + profile state
  const [session, setSession] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // where to return after auth
  const nextParam = useMemo(() => pathname || "/", [pathname]);

  // load session + subscribe
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSession(s || null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // fetch avatar (profiles.avatar_path in avatars bucket)
  useEffect(() => {
    (async () => {
      if (!session?.user?.id) {
        setAvatarUrl(null);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_path")
        .eq("id", session.user.id)
        .single();
      if (error || !data?.avatar_path) {
        setAvatarUrl(null);
        return;
      }
      const { data: pub } = supabase.storage
        .from("avatars")
        .getPublicUrl(data.avatar_path);
      setAvatarUrl(pub?.publicUrl || null);
    })();
  }, [session]);

  // open auth modal (supports both event + query param)
  const openAuth = () => {
    try {
      window.dispatchEvent(
        new CustomEvent("open-auth", { detail: { next: nextParam } })
      );
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("auth", "1");
    url.searchParams.set("next", nextParam);
    router.replace(url.pathname + "?" + url.searchParams.toString());
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileOpen(false);
    router.replace("/");
  };

  // derived letter
  const email = session?.user?.email || "";
  const letter = email ? email[0].toUpperCase() : "C";

  // close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-4xl font-extrabold tracking-tight text-cyan-500 hover:text-black"
        >
          COOVA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/browse" className="font-bold hover:text-cyan-500">
            Browse
          </Link>
          <Link href="/list" className="font-bold hover:text-cyan-500">
            List your space
          </Link>

          {/* auth area */}
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
                    {letter}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white p-2 shadow-xl"
                  role="menu"
                >
                  <Link
                    href="/profile"
                    className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
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

        {/* Mobile right side */}
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
                  {letter}
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
              href="/browse"
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
                      {letter}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 truncate max-w-[180px]">
                    {email}
                  </div>
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

      {/* Desktop click-away overlay for dropdown */}
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