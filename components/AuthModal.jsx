"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => setMounted(true), []);
  if (!mounted || !open) return null;

  async function sendMagicLink(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!email.trim()) return setErr("Enter a valid email.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMsg("Check your email for the magic link.");
    } catch (e) {
      setErr(e.message || "Failed to send link.");
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Log In or Sign Up</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <button
            onClick={signInGoogle}
            className="mb-4 w-full rounded-md bg-gray-900 py-2 text-white hover:opacity-90 disabled:opacity-60"
            disabled={loading}
          >
            Continue with Google
          </button>

          <form onSubmit={sendMagicLink} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
            {msg && <p className="text-sm text-emerald-600">{msg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}