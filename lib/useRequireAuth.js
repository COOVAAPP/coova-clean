// lib/useRequireAuth.js
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --------- lazy, safe client creator (doesn't throw if envs missing) ----------
let _sb = null;
function getSupabase() {
  if (_sb) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // stay graceful if not configured
  _sb = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return _sb;
}

/**
 * useRequireAuth()
 * - Keeps `user` in sync with Supabase
 * - Exposes a *callable* `requireAuth(cb, defaultTab)` that never crashes
 * - Optionally controls your AuthModal via `authOpen/setAuthOpen` & `authTab/setAuthTab`
 */
export default function useRequireAuth() {
  const sbRef = useRef(getSupabase());
  const sb = sbRef.current;

  const [user, setUser] = useState(null);

  // Optional UI wiring for your AuthModal (Header can use these or ignore)
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin"); // "signin" | "signup"
  const [returnTo, setReturnTo] = useState("/");

  // ---- bootstrap: read current session and subscribe to changes ----
  useEffect(() => {
    let sub;
    (async () => {
      if (!sb) return; // not configured; keep user=null
      const { data: { session } = {} } = await sb.auth.getSession();
      setUser(session?.user ?? null);

      sub = sb.auth.onAuthStateChange((_event, sess) => {
        setUser(sess?.user ?? null);
      });
    })();

    return () => sub?.data?.subscription?.unsubscribe?.();
  }, [sb]);

  // ---- sign-in / sign-up helpers (no-op if sb missing) ----
  const signInWithPassword = useCallback(
    async (email, password) => {
      if (!sb) return { error: new Error("Supabase not configured") };
      return sb.auth.signInWithPassword({ email, password });
    },
    [sb]
  );

  const signUpWithPassword = useCallback(
    async (email, password, options = {}) => {
      if (!sb) return { error: new Error("Supabase not configured") };
      return sb.auth.signUp({ email, password, options });
    },
    [sb]
  );

  const signInWithOAuth = useCallback(
    async (provider, opts = {}) => {
      if (!sb) return { error: new Error("Supabase not configured") };
      return sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: opts.redirectTo ?? window.location.href, ...opts },
      });
    },
    [sb]
  );

  const signOut = useCallback(async () => {
    if (!sb) return;
    await sb.auth.signOut();
  }, [sb]);

  // ---- the important bit: ALWAYS a callable function ----
  // If user exists -> run cb(). If not -> open modal (and choose tab).
  const requireAuth = useCallback(
    async (cb, defaultTab = "signin", next = "/") => {
      if (user) {
        // already authed
        if (typeof cb === "function") await cb();
        return;
      }
      // not authed: open modal via the hook's UI state (Header can ignore this if it manages its own)
      setAuthTab(defaultTab);
      setReturnTo(next);
      setAuthOpen(true);
    },
    [user]
  );

  // Optional convenience value (e.g., to disable buttons while misconfigured)
  const isConfigured = useMemo(() => Boolean(sb), [sb]);

  return {
    // state
    user,
    isConfigured,

    // modal state (optional—use only if you want the hook to drive your AuthModal)
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
    returnTo,
    setReturnTo,

    // actions
    requireAuth,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    signOut,

    // raw client if you need it
    supabase: sb,
  };
}