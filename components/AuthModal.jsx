"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Auth modal with Email Magic Link + Phone OTP (SMS).
 * Requires: Supabase Auth email + SMS configured.
 */
export default function AuthModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);    // success/info text
  const [error, setError] = useState(null);      // error text

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && onClose) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleEmail(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/`,
        },
      });
      if (error) throw error;
      setNotice("Magic link sent! Please check your email.");
    } catch (err) {
      setError(err?.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhone(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const value = phone.trim();
    if (!value) {
      setError("Please enter your phone number.");
      return;
    }
    // Require E.164 format (+15551234567). Adjust if you add a country selector.
    if (!value.startsWith("+")) {
      setError("Use international format like +15551234567.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: value,
      });
      if (error) throw error;
      setNotice("SMS code sent! Check your messages and enter code on next screen.");

      // Optional: if you build a code input step, navigate there:
      // window.location.href = "/verify-sms?phone=" + encodeURIComponent(value);

    } catch (err) {
      setError(err?.message || "Failed to send SMS code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose?.()} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={() => onClose?.()}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center text-2xl font-bold text-brand-600">Sign in to COOVA</h2>

        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setActiveTab("email"); setError(null); setNotice(null); }}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "email" ? "bg-white text-brand-600 shadow" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("phone"); setError(null); setNotice(null); }}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "phone" ? "bg-white text-brand-600 shadow" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Phone
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </div>
        )}

        {/* Forms */}
        {activeTab === "email" ? (
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhone} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1234"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use international format (e.g., +15551234567). Make sure SMS is enabled in Supabase Auth.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send SMS Code"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-brand-500 hover:text-brand-600">Terms</a> and{" "}
          <a href="/privacy" className="text-brand-500 hover:text-brand-600">Privacy</a>.
        </p>
      </div>
    </div>
  );
}