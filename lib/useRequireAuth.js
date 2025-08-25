// lib/useRequireAuth.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";

/**
 * useRequireAuth
 * - Tracks Supabase user session reactively
 * - requireAuth(cb, startTab): if logged in -> cb(); else open AuthModal with chosen tab
 * - Exposes modal control state for a single, shared AuthModal
 */
export default function useRequireAuth() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin"); // "signin" | "signup"
  const [loading, setLoading] = useState(true);

  // initial session fetch
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    // listen for changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      try {
        sub?.subscription?.unsubscribe();
      } catch {}
      isMounted = false;
    };
  }, []);

  // requireAuth: open modal if not authed, else run callback
  const requireAuth = useCallback(
    async (onAuthed = () => router.push("/list/create"), startTab = "signin") => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        onAuthed();
        return true;
      }
      setAuthTab(startTab);
      setAuthOpen(true);
      return false;
    },
    [router]
  );

  return {
    user,
    loading,
    requireAuth,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
  };
}