"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Track user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/"); // back to homepage
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#09ECFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">
          COOVA
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">
            Browse
          </Link>

          {user ? (
            <button onClick={handleSignOut} className="hover:opacity-80">
              Sign Out
            </button>
          ) : (
            <button onClick={() => setOpen(true)} className="hover:opacity-80">
              Log In
            </button>
          )}

          <Link
            href="/list"
            className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile button */}
        <div className="sm:hidden">
          {user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-white"
            >
              <span className="i-lucide-log-out h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              aria-label="Open Login"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 text-white"
            >
              <span className="i-lucide-user h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}