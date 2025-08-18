"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ onClose }) {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("email"); // 'email' | 'phone'
  const [loading, setLoading] = useState(false);

  // Email
  const [email, setEmail] = useState("");

  // Phone
  const [phone, setPhone] = useState(""); // E.164 e.g. +15551234567
  const [code, setCode] = useState("");
  const [phoneStep, setPhoneStep] = useState("request"); // 'request' | 'verify'

  const [message, setMessage] = useState("");

  useEffect(() => setMounted(true), []);

  // ----- Actions -----

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
        },
      });
      if (error) throw error;
    } catch (e) {
      setMessage(e.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function sendEmailMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      });
      if (error) throw error;
      setMessage("Check your inbox for the magic link.");
    } catch (e) {
      setMessage(e.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function requestSmsCode(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });
      if (error) throw error;
      setPhoneStep("verify");
      setMessage("SMS code sent. Enter the code to verify.");
    } catch (e) {
      setMessage(e.message || "Failed to send SMS code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifySmsCode(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: "sms",
        phone: phone.trim(),
        token: code.trim(),
      });
      if (error) throw error;
      setMessage("Success! You are signed in.");
      onClose?.();
    } catch (e) {
      setMessage(e.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  // ----- UI -----

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Log In or Sign Up</h2>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full mb-4 rounded-lg bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            Continue with Google
          </button>

          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setTab("email")}
              className={`rounded-md px-3 py-1 text-sm ${
                tab === "email" ? "bg-[#13D4D4] text-black" : "bg-gray-100 text-gray-700"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setTab("phone")}
              className={`rounded-md px-3 py-1 text-sm ${
                tab === "phone" ? "bg-[#13D4D4] text-black" : "bg-gray-100 text-gray-700"
              }`}
            >
              Phone
            </button>
          </div>

          {/* Email form */}
          {tab === "email" && (
            <form onSubmit={sendEmailMagicLink} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#13D4D4] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full rounded-lg bg-[#13D4D4] text-black py-2 font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}

          {/* Phone form */}
          {tab === "phone" && (
            <>
              {phoneStep === "request" && (
                <form onSubmit={requestSmsCode} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+15551234567"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#13D4D4] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full rounded-lg bg-[#13D4D4] text-black py-2 font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Code"}
                  </button>
                </form>
              )}

              {phoneStep === "verify" && (
                <form onSubmit={verifySmsCode} className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Enter the 6‑digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#13D4D4] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !code}
                    className="w-full rounded-lg bg-[#13D4D4] text-black py-2 font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>
              )}
            </>
          )}

          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

          <p className="mt-4 text-xs text-gray-500">
            By continuing you agree to COOVA’s Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );

  // Render into #modal-root if present, otherwise directly (SSR-safe)
  if (!mounted) return null;
  const host = document.getElementById("modal-root");
  return host ? createPortal(modal, host) : modal;
}