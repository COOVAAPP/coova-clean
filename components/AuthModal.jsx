// components/AuthModal.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal() {
  const router = useRouter();
  const qs = useSearchParams();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Open if ?auth=1 appears
  useEffect(() => {
    if (qs.get("auth") === "1") setOpen(true);
  }, [qs]);

  // Listen for global "open-auth" events from Header
  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.next || "/";
      const url = new URL(window.location.href);
      url.searchParams.set("auth", "1");
      url.searchParams.set("next", next);
      // This updates the URL and causes the effect above to setOpen(true)
      router.replace(url.pathname + "?" + url.searchParams.toString());
      setOpen(true);
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [router]);

  const close = useCallback(() => {
    setOpen(false);
    setError("");
    // remove auth params from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    // keep next so we can still redirect after OAuth
    router.replace(url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : ""));
  }, [router]);

  const afterLoginRedirect = () => {
    const next = qs.get("next") || "/";
    router.replace(next);
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(qs.get("next") || "/")}`,
        },
      });
      if (error) throw error;
      // will leave the page for OAuth
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setBusy(false);
    }
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(qs.get("next") || "/")}`,
        },
      });
      if (error) throw error;
      setError("Check your email for the login link.");
    } catch (err) {
      setError(err.message || "Unable to send magic link.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-cyan-500">Sign in to COOVA</h2>
          <button onClick={close} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="mb-3 w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:text-black disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-3 text-center text-xs uppercase tracking-wider text-gray-400">or</div>

        <form onSubmit={sendMagicLink} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-md border px-4 py-2 font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            Send magic link
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          After you sign in you’ll be sent back to{" "}
          <span className="font-semibold">{(typeof window !== "undefined" && (qs.get("next") || "/")) || "/"}</span>.
        </p>
      </div>
    </div>
  );
}