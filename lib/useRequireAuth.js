// lib/useRequireAuth.js
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useRequireAuth() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");
  const pendingCbRef = useRef(null);

  // keep user in sync
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data?.user ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // if a guarded action was waiting, run it once on first sign-in
      if (session?.user && pendingCbRef.current) {
        const cb = pendingCbRef.current;
        pendingCbRef.current = null;
        setAuthOpen(false);
        // run outside React tick
        Promise.resolve().then(() => cb());
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Call this for guarded actions (e.g., “List your space”)
  const requireAuth = useCallback(async (cb) => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      if (typeof cb === "function") await cb();
      return;
    }
    // not signed in → open modal and remember callback
    pendingCbRef.current = typeof cb === "function" ? cb : null;
    setAuthTab("signin");
    setAuthOpen(true);
  }, []);

  return {
    user,
    requireAuth,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
  };
}