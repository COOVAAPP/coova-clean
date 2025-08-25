// components/AuthModal.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - defaultTab?: "signin" | "signup"
 *
 * This component lazy-loads your Supabase browser client to avoid build-time
 * coupling. Update the candidate paths inside loadSupabase() if yours differs.
 */

export default function AuthModal({
  open,
  onClose,
  defaultTab = "signin",
}) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);
  const supabaseRef = useRef(null);

  // Keep tab in sync if parent changes defaultTab while open
  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // ESC to close, and basic focus trap
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        // very small focus trap
        const focusable = dialogRef.current?.querySelectorAll(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    setTimeout(() => firstFocusRef.current?.focus(), 0);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const header = useMemo(
    () => (tab === "signin" ? "Welcome back" : "Create your account"),
    [tab]
  );

  // ---- Supabase loader (lazy) ----
  async function loadSupabase() {
    if (supabaseRef.current) return supabaseRef.current;

    // ✅ Update these candidate paths if needed:
    const candidates = [
      "../supabaseClient",        // e.g. /components -> /supabaseClient.js
      "../lib/supabaseClient",    // e.g. /lib/supabaseClient.ts
    ];

    for (const p of candidates) {
      try {
        const mod = await import(/* @vite-ignore */ p);
        const sb =
          mod.supabase ||
          mod.client ||
          mod.default ||
          mod.sb ||
          (mod.createClient ? mod.createClient() : null);
        if (sb) {
          supabaseRef.current = sb;
          return sb;
        }
      } catch (_) {
        // try next candidate
      }
    }
    throw new Error(
      "Could not locate Supabase browser client. Update loadSupabase() paths."
    );
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = await loadSupabase();
      if (tab === "signin") {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        // optional: redirect or toast
        onClose?.();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          // You can add emailRedirectTo here if you use confirm emails:
          // options: { emailRedirectTo: `${location.origin}/auth/callback` }
        });
        if (err) throw err;
        onClose?.();
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider) {
    setBusy(true);
    setError("");
    try {
      const supabase = await loadSupabase();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (err) throw err;
      // For OAuth we redirect away; modal can close proactively
      onClose?.();
    } catch (err) {
      setError(err?.message || "OAuth error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-labelledby="auth-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose?.()}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        {/* Top border to match brand */}
        <div className="h-1 w-full bg-cyan-500 rounded-t-2xl" />

        {/* Content */}
        <div className="p-6">
          {/* Close */}
          <button
            ref={firstFocusRef}
            onClick={() => onClose?.()}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Heading */}
          <h2
            id="auth-modal-title"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            {header}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {tab === "signin"
              ? "Sign in to continue."
              : "Create an account to start listing or booking."}
          </p>

          {/* Tabs */}
          <div className="mt-4 inline-flex rounded-full bg-gray-100 p-1">
            <button
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${
                tab === "signin"
                  ? "bg-white text-cyan-700 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${
                tab === "signup"
                  ? "bg-white text-cyan-700 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex w-full items-center justify-center rounded-full border-2 border-cyan-500 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:opacity-50"
            >
              {busy
                ? "Please wait…"
                : tab === "signin"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-wide text-gray-400">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth("google")}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.7-2.6-5.7-5.8S8.9 5.7 12 5.7c1.8 0 2.9.8 3.5 1.4l2.4-2.3C16.7 3.4 14.6 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 11.8S6.9 21 12 21c6.3 0 8.7-4.4 8.7-6.6 0-.4 0-.7-.1-1H12z"
                />
              </svg>
              Google
            </button>
            
          </div>
        </div>

        {/* Footer help */}
        <div className="rounded-b-2xl border-t bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
          By continuing you agree to our Terms & Privacy.
        </div>

        {/* last focusable sentinel */}
        <button
          ref={lastFocusRef}
          className="sr-only"
          onFocus={() => firstFocusRef.current?.focus()}
          aria-hidden="true"
          tabIndex={0}
        />
      </div>
    </div>
  );
}