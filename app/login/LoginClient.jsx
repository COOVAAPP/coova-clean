"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Close modal
  const close = () => router.replace(redirect);

  // Redirect when session becomes available
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_ev, session) => {
      if (session) router.replace(redirect);
    });
    return () => sub.data.subscription.unsubscribe();
  }, [router, redirect]);

  async function signInWithEmail(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + redirect : redirect },
      });
      if (error) throw error;
      alert("Check your email for the magic link.");
    } catch (err) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: typeof window !== "undefined" ? window.location.origin + redirect : redirect },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Log In or Sign Up</h2>
          <button onClick={close} aria-label="Close" className="text-gray-500 hover:text-black">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90"
          >
            Continue with Google
          </button>

          <div className="relative text-center">
            <span className="px-2 bg-white text-xs text-gray-500 relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
          </div>

          <form onSubmit={signInWithEmail} className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
              placeholder="you@email.com"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-md bg-[#13D4D4] text-black py-2 font-medium hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Magic Link"}
            </button>
          </form>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <p className="text-[11px] text-gray-500">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}