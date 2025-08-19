// components/UserMenu.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// close on outside click
function useOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [handler, ref]);
}

export default function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [initials, setInitials] = useState("U");
  const panelRef = useRef(null);

  useOutside(panelRef, () => setOpen(false));

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);

      const user = data.session?.user;
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "User";
        const init = name
          .replace(/[^A-Za-z ]/g, "")
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setInitials(init || "U");
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) =>
      setSession(sess || null)
    );
    return () => sub.subscription?.unsubscribe?.();
  }, []);

  if (!session) return null;

  async function onSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white font-semibold shadow hover:opacity-90"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-black/10 bg-white shadow-lg z-50">
          <div className="px-4 py-3 border-b border-black/10">
            <p className="text-sm text-gray-600">Signed in</p>
            <p className="font-semibold text-gray-900 truncate">
              {session.user.email}
            </p>
          </div>

          <nav className="py-1">
            <Link href="/listing?mine=1" className="block px-4 py-2 text-sm hover:bg-gray-50">
              My Listings
            </Link>
            <Link href="/list" className="block px-4 py-2 text-sm hover:bg-gray-50">
              Create Listing
            </Link>
            <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50">
              Settings
            </Link>
            <button
              onClick={onSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}