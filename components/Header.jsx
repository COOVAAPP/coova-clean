"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-4xl font-extrabold text-cyan-500 tracking-tight">
          COOVA
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-bold hover:text-cyan-500">
            Browse
          </Link>
          <Link href="/list" className="font-bold hover:text-cyan-500">
            List your space
          </Link>

          {session ? (
            <>
              <Link href="/profile" className="font-bold hover:text-cyan-500">
                Profile
              </Link>
              <Link href="/dashboard" className="font-bold hover:text-cyan-500">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:bg-cyan-500"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}