// lib/useRequireAuth.js
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * useRequireAuth
 * @param {Object} opts
 * @param {(tab: "signin" | "signup") => void} [opts.onRequire] - call to open your AuthModal
 */
export default function useRequireAuth(opts = {}) {
  const { onRequire } = opts;
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // initial load
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session || null);
        setUser(session?.user || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || null);
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  /**
   * requireAuth
   * Ensures logged-in state. If not, opens your AuthModal via onRequire().
   * If logged in, runs the provided callback.
   */
  const requireAuth = useCallback(
    async (cb, defaultTab = "signin") => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // open your modal at the desired tab
        if (typeof onRequire === "function") onRequire(defaultTab);
        return { ok: false };
      }

      if (typeof cb === "function") await cb();
      return { ok: true };
    },
    [onRequire, supabase]
  );

  return {
    loading,
    user,
    session,
    signOut,
    requireAuth,
  };
}