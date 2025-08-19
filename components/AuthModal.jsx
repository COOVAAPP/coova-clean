// components/AuthModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";

  const [tab, setTab] = useState("email"); // "email" | "phone"
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // email
  const [email, setEmail] = useState("");

  // phone
  const [phone, setPhone] = useState(""); // E.164 format recommended, e.g. +12025550123
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");

  const dialogRef = useRef(null);

  // close on escape & backdrop
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    setMsg("");
    setErr("");
  }, [tab, open]);

  async function handleEmailMagicLink(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      if (!email.trim()) throw new Error("Enter your email.");
      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
              : undefined,
        },
      });
      if (error) throw error;
      setMsg("Magic link sent. Check your email.");
    } catch (e) {
      setErr(e.message || "Failed to send magic link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendSms(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      const normalized = phone.trim();
      if (!normalized) throw new Error("Enter your phone number.");
      // Send SMS code
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: {
          channel: "sms",
        },
      });
      if (error) throw error;
      setCodeSent(true);
      setMsg("Code sent via SMS.");
    } catch (e) {
      setErr(e.message || "Failed to send SMS code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifySms(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      const normalized = phone.trim();
      if (!normalized) throw new Error("Enter your phone number.");
      if (!otp.trim()) throw new Error("Enter the code you received.");

      const { error } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: otp.trim(),
        type: "sms",
      });
      if (error) throw error;

      // success → go to redirect
      onClose?.();
      router.replace(redirect);
    } catch (e) {
      setErr(e.message || "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onClose?.()}
      />
      {/* modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sign in / Sign up</h2>
          <button
            onClick={() => onClose?.()}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-lg border border-gray-200 p-1">
          <button
            className={`rounded-md py-2 text-sm font-medium ${
              tab === "email" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setTab("email")}
          >
            Email
          </button>
          <button
            className={`rounded-md py-2 text-sm font-medium ${
              tab === "phone" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setTab("phone")}
          >
            Phone
          </button>
        </div>

        {/* Messages */}
        {msg ? <p className="mb-3 text-sm text-green-700">{msg}</p> : null}
        {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}

        {/* EMAIL FORM */}
        {tab === "email" && (
          <form onSubmit={handleEmailMagicLink} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        )}

        {/* PHONE FORM */}
        {tab === "phone" && (
          <form
            onSubmit={codeSent ? handleVerifySms : handleSendSms}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                placeholder="+12025550123"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use your full number with country code (e.g. +1…).
              </p>
            </div>

            {codeSent && (
              <div>
                <label className="mb-1 block text-sm font-medium">SMS Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  placeholder="6-digit code"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (codeSent ? "Verifying…" : "Sending…") : (codeSent ? "Verify Code" : "Send Code")}
            </button>

            {codeSent && (
              <button
                type="button"
                onClick={handleSendSms}
                disabled={busy}
                className="w-full rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                Resend Code
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}