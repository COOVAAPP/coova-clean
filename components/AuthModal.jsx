"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function AuthModal({ open, onClose }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [mode, setMode] = useState("signup"); // "signup" | "signin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/api/auth/callback`
                : undefined,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onClose?.();
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
      // Supabase will redirect; modal will close on return
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("signup")}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${
                mode === "signup" ? "bg-[#13D4D4] text-black" : "text-gray-600"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setMode("signin")}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${
                mode === "signin" ? "bg-[#13D4D4] text-black" : "text-gray-600"
              }`}
            >
              Log in
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <h3 className="text-xl font-semibold mb-3">
            {mode === "signup" ? "Welcome to COOVA!" : "Welcome back"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {mode === "signup"
              ? "Create your account to start booking or hosting."
              : "Log in to continue."}
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13D4D4]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#13D4D4]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-black text-white py-2 font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "signup"
                ? "Create account"
                : "Log in"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded-full border py-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="mt-4 text-xs text-gray-500">
            By continuing, you agree to the Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}