// components/Header.jsx
// components/Header.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const openAuth = (mode = "signin", next = "/") => {
    const qs = new URLSearchParams({ auth: "1", mode, next });
    router.push(`/?${qs.toString()}`);
  };

  const onClickList = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) openAuth("signup", "/list/create");
    else router.push("/list/create");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const navLinks = (
    <>
      <Link href="/browse" className="text-sm font-semibold hover:text-cyan-600">
        Browse
      </Link>
      <button onClick={onClickList} className="text-sm font-semibold hover:text-cyan-600">
        List your space
      </button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-extrabold text-cyan-500">
          COOVA
        </Link>

        {/* desktop */}
        <nav className="hidden items-center gap-4 sm:flex">
          {navLinks}
          {!session ? (
            <button
              className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-cyan-600"
              onClick={() => openAuth("signin")}
            >
              Sign in / Sign up
            </button>
          ) : (
            <div className="relative group">
              <button className="rounded-full bg-cyan-100 px-3 py-1.5 text-sm font-bold text-cyan-700">
                {user?.email?.split("@")[0] ?? "Account"}
              </button>
              <div className="absolute right-0 mt-2 hidden w-40 rounded-md border bg-white p-2 text-sm shadow-lg group-hover:block">
                <Link className="block rounded px-2 py-1 hover:bg-gray-50" href="/dashboard">
                  Dashboard
                </Link>
                <button className="block w-full rounded px-2 py-1 text-left hover:bg-gray-50" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* mobile */}
        <button className="sm:hidden" onClick={() => setMobileOpen((s) => !s)} aria-label="Open menu">
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden">
          <div className="space-y-2 border-t bg-white p-4">
            {navLinks}
            {!session ? (
              <button
                className="block rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-cyan-600"
                onClick={() => openAuth("signin")}
              >
                Sign in / Sign up
              </button>
            ) : (
              <>
                <Link className="block rounded px-2 py-1 hover:bg-gray-50" href="/dashboard" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button className="block rounded px-2 py-1 text-left hover:bg-gray-50" onClick={signOut}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}