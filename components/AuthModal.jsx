// components/AuthModal.jsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // ✅ your singleton browser client

/**
 * Props:
 *  - open: boolean (controls visibility)
 *  - onClose: () => void
 *  - defaultTab?: "signin" | "signup"
 */
export default function AuthModal({ open, onClose, defaultTab = "signin" }) {
  // tabs
  const [tab, setTab] = useState(defaultTab); // "signin" | "signup"
  useEffect(() => setTab(defaultTab), [defaultTab]);

  // form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // for focus trapping
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      // reset transient messages whenever modal reopens
      setError("");
      setInfo("");
      // autofocus first field
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open]);

  const close = useCallback(() => {
    if (submitting) return;
    onClose?.();
  }, [onClose, submitting]);

  // ---- OAuth: Google -------------------------------------------------------
  const signInWithGoogle = useCallback(async () => {
    setError("");
    setInfo("");
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      // Redirect happens automatically; no need to close here.
    } catch (e) {
      console.error(e);
      setError(e?.message || "Google sign-in failed.");
    }
  }, []);

  // ---- Email/Password flows -----------------------------------------------
  const handleEmailPassword = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setSubmitting(true);
      setError("");
      setInfo("");

      try {
        if (tab === "signin") {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          // success — close modal
          close();
        } else {
          // signup
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo:
                typeof window !== "undefined"
                  ? `${window.location.origin}/`
                  : undefined,
            },
          });
          if (error) throw error;
          setInfo(
            "Check your inbox to confirm your email, then sign in to continue."
          );
          // keep modal open so they can see the message
        }
      } catch (e) {
        console.error(e);
        setError(e?.message || "Authentication failed.");
      } finally {
        setSubmitting(false);
      }
    },
    [tab, email, password, close]
  );

  // ---- Derived UI ----------------------------------------------------------
  const title = tab === "signin" ? "Welcome back" : "Create your account";
  const primaryCta = tab === "signin" ? "Sign in" : "Create account";

  // ---- Render nothing if closed -------------------------------------------
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/50 transition-opacity"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-3 top-3 rounded p-1 text-gray-400 hover:bg-gray-100"
          aria-label="Close authentication dialog"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 8.586 4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Title */}
        <h3 className="mb-1 text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mb-4 text-sm text-gray-500">
          {tab === "signin"
            ? "Sign in to continue."
            : "Use email & password to get started."}
        </p>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              tab === "signin"
                ? "bg-cyan-100 text-cyan-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTab("signin")}
          >
            Sign in
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              tab === "signup"
                ? "bg-cyan-100 text-cyan-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setTab("signup")}
          >
            Sign up
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {info}
          </div>
        )}

        {/* Email / Password form */}
        <form onSubmit={handleEmailPassword} className="space-y-3">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Email
            </label>
            <input
              id="auth-email"
              ref={firstFieldRef}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-cyan-500/0 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-xs font-medium text-gray-600"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPw ? "text" : "password"}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm outline-none ring-cyan-500/0 focus:ring-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d={
                      showPw
                        ? "M3 3l18 18M10.584 10.587a2 2 0 002.829 2.829M9.88 4.887A9.956 9.956 0 0112 4c5.523 0 10 4.477 10 10 0 1.048-.161 2.057-.461 3M6.37 6.37C4.9 7.67 4 9.735 4 12c0 5.523 4.477 10 10 10 2.265 0 4.33-.9 5.63-2.37"
                        : "M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12zm11 3a3 3 0 110-6 3 3 0 010 6z"
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-md bg-cyan-600 px-4 py-2 text-white shadow hover:bg-cyan-700 disabled:opacity-60"
          >
            {submitting ? "Please wait…" : primaryCta}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing you agree to our Terms &amp; Privacy.
        </p>
      </div>
    </div>
  );
}