"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

const AVATAR_BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";
const SIGNED_URL_EXPIRES = Number(process.env.NEXT_PUBLIC_AVATAR_URL_TTL || 3600);

export default function Header() {
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSession(s);
      await refreshAvatar(s?.user?.id);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await refreshAvatar(s?.user?.id);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function refreshAvatar(userId?: string) {
    if (!userId) {
      setAvatarUrl("");
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", userId)
      .maybeSingle<{ avatar_path: string | null }>();

    if (prof?.avatar_path) {
      const { data, error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(prof.avatar_path, SIGNED_URL_EXPIRES);
      if (!error) setAvatarUrl(data.signedUrl);
    } else {
      setAvatarUrl("");
    }
  }

  // click-outside close
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userInitial = (session?.user?.email?.[0] || "U").toUpperCase();

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-4xl font-extrabold text-cyan-500 tracking-tight hover:text-black">
            COOVA
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="font-bold hover:text-cyan-500">Browse</Link>
            <Link href="/list" className="font-bold hover:text-cyan-500">List your space</Link>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500 font-bold text-white overflow-hidden"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : userInitial}
                </button>

                <div
                  className={[
                    "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white border border-gray-200 py-2 z-50 origin-top-right transform transition",
                    "duration-150 ease-out",
                    dropdownOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-1 scale-95 pointer-events-none",
                  ].join(" ")}
                  role="menu"
                  aria-hidden={!dropdownOpen}
                >
                  <Link href="/profile" className="block px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500" onClick={() => setDropdownOpen(false)}>Profile</Link>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-50 hover:text-cyan-500">Sign out</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:text-black">
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}