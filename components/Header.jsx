"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// client-only modal to avoid SSR issues
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

export default function Header() {
  const router = useRouter();
  const search = useSearchParams();

  // session state
  const [session, setSession] = useState(null);

  // UI state
  const [open, setOpen] = useState(false);     // mobile nav
  const [showAuth, setShowAuth] = useState(false);

  // on mount, fetch session + subscribe
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Auto-open modal if we hit /?auth=1
  useEffect(() => {
    if (search?.get("auth") === "1") setShowAuth(true);
  }, [search]);

  // after successful auth, close modal & go to /list
  function handleAuthed() {
    setShowAuth(false);
    router.replace("/list");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-4xl font-extrabold tracking-wide text-white">
          COOVA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>

          {!session ? (
            <>
              <button
                onClick={() => setShowAuth(true)}
                className="hover:opacity-80"
              >
                Log In / Sign Up
              </button>
              {/* Protected CTA: open modal if not logged in */}
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
              >
                List Your Space
              </button>
            </>
          ) : (
            <>
              {/* If logged in, go straight to /list */}
              <Link
                href="/list"
                className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
              >
                List Your Space
              </Link>
              <button onClick={signOut} className="hover:opacity-80">
                Sign Out
              </button>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-black">
          <button onClick={() => setOpen(v => !v)} aria-label="Toggle Menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1" onClick={() => setOpen(false)}>Browse</Link>

            {!session ? (
              <>
                <button
                  className="py-1 text-left"
                  onClick={() => { setShowAuth(true); setOpen(false); }}
                >
                  Log In / Sign Up
                </button>
                <button
                  className="py-1 text-left"
                  onClick={() => { setShowAuth(true); setOpen(false); }}
                >
                  List Your Space
                </button>
              </>
            ) : (
              <>
                <Link href="/list" className="py-1" onClick={() => setOpen(false)}>
                  List Your Space
                </Link>
                <button className="py-1 text-left" onClick={() => { setOpen(false); signOut(); }}>
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthed={handleAuthed} // redirect to /list after Google/SMS success
        />
      )}
    </header>
  );
}