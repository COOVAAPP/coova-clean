"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMsg("");
      setEmail("");
      // lock scroll
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function sendMagicLink(e) {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    setMsg("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setMsg("Check your email for a sign-in link.");
      // Optional: auto-close the modal after a short delay
      setTimeout(() => onClose?.(), 800);
    } catch (err) {
      setMsg(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  function onBackdrop(e) {
    if (e.target === dialogRef.current) onClose?.();
  }

  return (
    <div
      ref={dialogRef}
      onClick={onBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sign in to COOVA</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={sendMagicLink} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !email}
            className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send Magic Link"}
          </button>
        </form>

        {msg ? (
          <p className="mt-3 text-sm text-gray-700">{msg}</p>
        ) : (
          <p className="mt-3 text-xs text-gray-500">
            We’ll email you a secure sign-in link. No password needed.
          </p>
        )}
      </div>
    </div>
  );
}