"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const TABS = ["email", "phone"];
const cn = (...c) => c.filter(Boolean).join(" ");

export default function AuthModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);

  // tab + form state
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // E.164 format e.g. +15551234567
  const [code, setCode] = useState("");   // 6-digit OTP

  // ui state
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  async function signInWithGoogle() {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setMessage(error.message);
  }

  async function sendMagicLink() {
    if (!email) return;
    setSending(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Adjust if you’re using a dedicated callback route
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("Magic link sent. Check your email.");
    } catch (err) {
      setMessage(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  async function sendSmsCode() {
    if (!phone) return;
    setSending(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setMessage("We sent you a code via SMS.");
    } catch (err) {
      setMessage(err.message || "Failed to send SMS code.");
    } finally {
      setSending(false);
    }
  }

  async function verifySms() {
    if (!phone || !code) return;
    setVerifying(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      onClose?.(); // close modal on success
    } catch (err) {
      setMessage(err.message || "Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="relative z-[101] w-[380px] max-w-[92vw] rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Log In or Sign Up</h3>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-md bg-gray-100 p-1 text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md py-1 transition",
                tab === t ? "bg-white shadow font-medium" : "text-gray-600"
              )}
            >
              {t === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          className="mb-3 w-full rounded-md bg-black py-2 text-white hover:opacity-90"
        >
          Continue with Google
        </button>

        {/* Email tab */}
        {tab === "email" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={sendMagicLink}
              disabled={!email || sending}
              className="mt-3 w-full rounded-md bg-brand-600 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send Magic Link"}
            </button>
          </div>
        )}

        {/* Phone tab */}
        {tab === "phone" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+15551234567"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={sendSmsCode}
                disabled={!phone || sending}
                className="flex-1 rounded-md bg-gray-900 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send Code"}
              </button>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6‑digit code"
                className="flex-1 rounded border border-gray-300 px-3 py-2"
              />
              <button
                onClick={verifySms}
                disabled={!phone || !code || verifying}
                className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {verifying ? "Verifying…" : "Verify"}
              </button>
            </div>
          </div>
        )}

        {/* message */}
        {message ? (
          <p className="mt-3 text-xs text-gray-600">{message}</p>
        ) : null}

        <p className="mt-3 text-[11px] text-gray-500">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}