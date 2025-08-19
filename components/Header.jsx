// components/Header.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserMenu from "./UserMenu";

export default function Header() {
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) =>
      setSession(sess || null)
    );
    return () => sub.subscription?.unsubscribe?.();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="font-extrabold text-white tracking-wide text-4xl">
          COOVA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center font-bold gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">
            Browse
          </Link>

          {session ? (
            <>
              <Link href="/list" className="hover:opacity-80">
                List Your Space
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:opacity-80">
                Log in
              </Link>
              <Link
                href="/list"
                className="rounded-full bg-black font-bold text-white px-4 py-2 text-sm hover:opacity-90"
              >
                List Your Space
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle Menu"
        >
          <span className="i-lucide-menu h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1">
              Browse
            </Link>

            {session ? (
              <>
                <Link href="/list" className="py-1">
                  List Your Space
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setOpen(false);
                  }}
                  className="text-left py-1 text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="py-1">
                  Log in
                </Link>
                <Link href="/list" className="py-1">
                  List Your Space
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}