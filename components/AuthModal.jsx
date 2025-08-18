"use client";

import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  if (!open) return null;

  const signInWithGoogle = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/api/auth/callback` },
      });
    } catch (e) {
      console.error(e);
      alert("Google sign-in failed.");
    }
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSending(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/api/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      console.error(err);
      alert("Could not send magic link. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-500/10 to-brand-500/0 border-b border-black/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sign Up or Log In</h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Google */}
          <button
            onClick={signInWithGoogle}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-black/10 bg-white hover:bg-gray-50 px-4 py-3 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12   s5.373-12,12-12c3.059,0,5.842,1.156,7.961,3.039l5.657-5.657C33.02,6.053,28.746,4,24,4C12.955,4,4,12.955,4,24   s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.815C14.488,16.114,18.879,14,24,14c3.059,0,5.842,1.156,7.961,3.039l5.657-5.657   C33.02,6.053,28.746,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.176,0,9.86-1.977,13.409-5.197l-6.197-5.239C29.189,35.091,26.739,36,24,36   c-5.192,0-9.607-3.315-11.247-7.946l-6.53,5.031C8.536,39.556,15.673,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.79,2.231-2.242,4.163-4.197,5.561c0.002-0.001,0.004-0.003,0.006-0.004   l6.197,5.239C36.888,39.061,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4 text-xs text-gray-500">
            <span className="h-px flex-1 bg-black/10" />
            or use email
            <span className="h-px flex-1 bg-black/10" />
          </div>

          {/* Email */}
          {!sent ? (
            <form onSubmit={signInWithEmail} className="space-y-3">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/60"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-brand-600 text-white font-semibold py-3 hover:bg-brand-700 disabled:opacity-60"
              >
                {sending ? "Sending link…" : "Send Magic Link"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg bg-brand-50 border border-brand-100 text-brand-800 p-3">
              We’ve sent you a login link. Check your email to continue.
            </div>
          )}

          <p className="mt-4 text-[11px] text-gray-500">
            By continuing, you agree to COOVA’s{" "}
            <a href="/terms" className="underline">Terms</a> and{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}