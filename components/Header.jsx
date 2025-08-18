// components/Header.jsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [openAuth, setOpenAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 supports-[backdrop-filter]:bg-[#9EFCFF]/90 backdrop-blur">
        <div className="container-page h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-4xl font-bold text-white tracking-wide">COOVA</Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/browse" className="hover:opacity-80">Browse</Link>

            {!session ? (
              <button
                onClick={() => setOpenAuth(true)}
                className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Log In
              </button>
            ) : (
              <>
                <Link href="/list" className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90">
                  List Your Space
                </Link>
                <button onClick={signOut} className="text-sm hover:opacity-80">Log Out</button>
              </>
            )}
          </nav>

          {/* Mobile menu button (existing) */}
          <button
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-white bg-black/60"
            onClick={() => setOpenAuth(true)}
            aria-label="Open auth"
          >
            {/* Hamburger icon */}
            <span className="i-lucide-menu h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal open={openAuth} onClose={() => setOpenAuth(false)} />
    </>
  );
}