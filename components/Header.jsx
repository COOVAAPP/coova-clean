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

  const [openAuth, setOpenAuth] = useState(false);
  const [session, setSession] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  // Load session and keep in sync
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
    })();

    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess ?? null);
      // If the modal is open and we now have a session, close and return home
      if (sess && openAuth) {
        setOpenAuth(false);
        router.push("/");
      }
    });

    return () => {
      mounted = false;
      sub.data.subscription.unsubscribe();
    };
  }, [openAuth, router]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  }

  // Require auth to list a space
  function handleListClick() {
    if (session) {
      router.push("/list");
    } else {
      setOpenAuth(true); // open auth modal instead of navigating
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCCF]/90 backdrop-blur"
        role="banner"
      >
        <div className="container-page h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-wide text-[#0b5]"
            aria-label="COOVA Home"
          >
            COOVA
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/browse" className="hover:opacity-80">
              Browse
            </Link>

            {!session ? (
              <button
                onClick={() => setOpenAuth(true)}
                className="hover:opacity-80"
                aria-haspopup="dialog"
                aria-controls="auth-modal"
              >
                Log in
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="hover:opacity-80"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}

            {/* Require login for List Your Space */}
            <button
              onClick={handleListClick}
              className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
            >
              List Your Space
            </button>
          </nav>

          {/* Mobile actions */}
          <div className="sm:hidden flex items-center gap-2">
            {!session ? (
              <button
                onClick={() => setOpenAuth(true)}
                className="rounded-md border border-black/10 px-3 py-1 text-sm"
                aria-haspopup="dialog"
                aria-controls="auth-modal"
              >
                Log in
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-md border border-black/10 px-3 py-1 text-sm"
              >
                {signingOut ? "…" : "Sign out"}
              </button>
            )}

            {/* Require login for List on mobile too */}
            <button
              onClick={handleListClick}
              className="rounded-full bg-black text-white px-3 py-1 text-sm"
            >
              List
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        aria-label="auth-modal"
      />
    </>
  );
}