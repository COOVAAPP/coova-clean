// components/AuthModal.jsx
"use client";

/**
 * Full Auth Modal
 * - Sign in / Sign up tabs
 * - Email + Password auth
 * - Google OAuth (Apple/GitHub easy to re-enable)
 * - Overlay click & ESC to close
 * - Error/Loading states
 * - Works in Next.js App Router (client-only)
 */

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthModal({
  isOpen = false,
  onClose = () => {},
  defaultTab = "signin", // "signin" | "signup"
}) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const modalRef = useRef(null);
  const firstFieldRef = useRef(null);

  // keep tab in sync if parent changes default tab
  useEffect(() => setTab(defaultTab), [defaultTab]);

  // focus first field on open
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen, tab]);

  // close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const validate = useCallback(() => {
    if (!email) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    if (tab === "signup" && password.length < 6)
      return "Password must be at least 6 characters.";
    if (tab === "signup" && confirm !== password)
      return "Passwords do not match.";
    return "";
  }, [email, password, confirm, tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        onClose(); // success
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (err) throw err;
        setInfo("Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    resetMessages();
    setOauthLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      // redirect handled by provider; modal can close
      // (leaving it open is fine too; it will be replaced by redirect)
    } catch (err) {
      setError(err?.message || "OAuth sign-in failed.");
    } finally {
      setOauthLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-[92vw] max-w-md rounded-xl bg-white shadow-xl"
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-2 text-gray-500 hover:bg-gray-100"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <h2 className="text-2xl font-bold">
            {tab === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {tab === "signin"
              ? "Sign in to continue."
              : "Sign up to start listing or booking."}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="mb-4 inline-flex rounded-full bg-gray-100 p-1">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign in
            </TabButton>
            <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
              Sign up
            </TabButton>
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            ref={firstFieldRef}
            type="email"
            autoComplete="email"
            className="mb-3 w-full rounded-md border px-3 py-2 outline-none ring-brand-500 focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label className="mb-2 mt-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            autoComplete={tab === "signin" ? "current-password" : "new-password"}
            className="mb-3 w-full rounded-md border px-3 py-2 outline-none ring-brand-500 focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {tab === "signup" && (
            <>
              <label className="mb-2 mt-1 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="mb-3 w-full rounded-md border px-3 py-2 outline-none ring-brand-500 focus:ring"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-cyan-500 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
          >
            {loading ? (tab === "signin" ? "Signing in…" : "Creating…") : (tab === "signin" ? "Sign in" : "Create account")}
          </button>

          <div className="my-3 text-center text-xs text-gray-500">
            By continuing you agree to our <a href="/terms" className="underline">Terms</a> &nbsp;and&nbsp;
            <a href="/privacy" className="underline">Privacy</a>.
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center px-6 py-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="px-3 text-xs uppercase tracking-wider text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* OAuth */}
        <div className="px-6 pb-6">
          <button
            disabled={oauthLoading}
            onClick={() => handleOAuth("google")}
            className="flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* To re-enable later: Apple/GitHub */}
          {/* 
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={() => handleOAuth("github")} className="...">GitHub</button>
            <button onClick={() => handleOAuth("apple")} className="...">Apple</button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

/* --------------------- helpers --------------------- */

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-1.5 text-sm font-semibold transition",
        active ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" {...props}>
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
          s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.202,6.053,28.791,4,24,4C12.955,4,4,12.955,4,24
          s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
          C33.202,6.053,28.791,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c4.717,0,9.005-1.809,12.26-4.756l-5.657-5.657C28.595,35.091,26.393,36,24,36
          c-5.202,0-9.62-3.318-11.277-7.953l-6.528,5.026C9.5,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.79,2.229-2.232,4.162-4.04,5.587l5.657,5.657
          C38.689,36.491,44,31,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}