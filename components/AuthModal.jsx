// components/AuthModal.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthModal({
  open,
  onClose,
  defaultTab = "signin", // "signin" | "signup"
}) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // signup only

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const dialogRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setMsg(null);
      setLoading(false);
      setTimeout(() => {
        try {
          emailRef.current?.focus();
        } catch {}
      }, 25);
    }
  }, [open, defaultTab]);

  const setError = (text) => setMsg({ type: "error", text });
  const setSuccess = (text) => setMsg({ type: "success", text });

  const validate = useCallback(() => {
    if (!email) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Please enter your password.";
    if (tab === "signup" && fullName.trim().length < 2)
      return "Please enter your full name.";
    return null;
  }, [email, password, tab, fullName]);

  const handleEmailPassword = async (e) => {
    e?.preventDefault?.();
    setMsg(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccess("Signed in successfully.");
        setTimeout(() => {
          onClose?.();
          window.location.reload();
        }, 500);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess("Account created. Check your email for confirmation.");
        setTimeout(() => {
          onClose?.();
        }, 800);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="w-[92%] max-w-md rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {tab === "signin" ? "Sign in to COOVA" : "Create your COOVA account"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4">
          <div className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-1">
            <button
              className={`rounded-full px-5 py-1.5 text-sm font-bold ${
                tab === "signin"
                  ? "bg-cyan-500 text-white shadow hover:bg-black"
                  : "text-gray-600 hover:text-cyan-500"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`rounded-full px-5 py-1.5 text-sm font-bold ${
                tab === "signup"
                  ? "bg-cyan-500 text-white shadow hover:bg-black"
                  : "text-gray-600 hover:text-cyan-500"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          className="px-5 pb-5 pt-4 space-y-4"
          onSubmit={handleEmailPassword}
        >
          {tab === "signup" && (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-full border px-4 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>

          {msg && (
            <div
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                msg.type === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border-2 border-cyan-500 bg-white px-5 py-2 font-bold text-cyan-500 shadow hover:bg-cyan-50 hover:text-black disabled:opacity-50"
          >
            {loading
              ? tab === "signin"
                ? "Signing in..."
                : "Creating account..."
              : tab === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs uppercase tracking-wide text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 font-bold text-gray-700 shadow hover:border-cyan-500 hover:text-cyan-500 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.8 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.4 5.1 28.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.7-.4-3.9z"
              />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.4 5.1 28.9 3 24 3 15.5 3 8.2 7.7 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.3 0 10.2-2 13.8-5.3l-6.4-5.2C29.4 35 26.8 36 24 36c-5.4 0-9.8-3.3-11.3-7.7l-6.5 5C8 40.3 15.4 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3C33.8 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.4 5.1 28.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.7-.4-3.9z" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}