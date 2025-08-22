// components/AuthModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ forceOpen = false, defaultNext = "/" }) {
  const router = useRouter();

  const [open, setOpen] = useState(forceOpen || hasAuthQuery());
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  function getUrl() {
    return new URL(window.location.href);
  }
  function getNextFromUrl() {
    try {
      const u = getUrl();
      return u.searchParams.get("next") || defaultNext;
    } catch {
      return defaultNext;
    }
  }
  function setAuthParamsInUrl(nextPath) {
    const u = getUrl();
    u.searchParams.set("auth", "1");
    if (nextPath) u.searchParams.set("next", nextPath);
    router.replace(u.pathname + "?" + u.searchParams.toString());
  }
  function removeAuthFromUrl(keepNext = true) {
    const u = getUrl();
    u.searchParams.delete("auth");
    if (!keepNext) u.searchParams.delete("next");
    const qs = u.searchParams.toString();
    router.replace(u.pathname + (qs ? "?" + qs : ""));
  }
  function hasAuthQuery() {
    if (typeof window === "undefined") return false;
    const u = new URL(window.location.href);
    return u.searchParams.get("auth") === "1";
  }

  useEffect(() => {
    // open on first load if ?auth=1
    if (hasAuthQuery()) setOpen(true);

    // open on event
    const onOpen = (e) => {
      const next = e?.detail?.next || getNextFromUrl();
      setAuthParamsInUrl(next);
      setOpen(true);
    };
    window.addEventListener("open-auth", onOpen);

    const onPop = () => setOpen(hasAuthQuery());
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("open-auth", onOpen);
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    setToast("");
    setError("");
    removeAuthFromUrl(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  // close + redirect once session exists
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        const to = getNextFromUrl();
        removeAuthFromUrl(false);
        router.replace(to || "/");
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const next = getNextFromUrl();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (e) {
      setError(e?.message || "Could not start Google sign-in.");
      setBusy(false);
    }
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setToast("");
    try {
      const next = getNextFromUrl();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            next
          )}`,
        },
      });
      if (error) throw error;
      setToast("Check your email for the login link.");
    } catch (err) {
      setError(err?.message || "Unable to send magic link.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div ref={cardRef} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sign in to COOVA</h2>
          <button
            onClick={close}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          You’ll be redirected to <span className="font-medium">{getNextFromUrl()}</span> after sign-in.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="mt-4 w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:text-black disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            disabled={busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-cyan-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md border px-4 py-2 font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {toast && (
          <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 text-center">
          <button
            onClick={close}
            className="text-sm text-gray-500 underline-offset-2 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}