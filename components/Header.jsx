// app/components/Header.jsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userEmail = session?.user?.email || "";
  const userInitial = userEmail ? userEmail[0].toUpperCase() : null;

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="text-4xl font-extrabold text-cyan-500 tracking-tight hover:text-black"
          >
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
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500 font-bold text-white focus:outline-none"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  {userInitial}
                </button>

                {/* Animated dropdown (kept mounted for smooth in/out) */}
                <div
                  className={[
                    "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-200 py-2 z-50 origin-top-right transform transition",
                    "duration-150 ease-out",
                    dropdownOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
                  ].join(" ")}
                  role="menu"
                  aria-hidden={!dropdownOpen}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500"
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500"
                    onClick={() => setDropdownOpen(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:text-black"
              >
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}