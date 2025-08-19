"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // email state
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  // phone state
  const [phone, setPhone] = useState(""); // E.164: +15551234567
  const [code, setCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsError, setSmsError] = useState("");

  useEffect(() => {
    if (!open) {
      // reset form when closed
      setActiveTab("email");
      setEmail("");
      setSending(false);
      setSentMsg("");
      setPhone("");
      setCode("");
      setSmsSent(false);
      setSmsError("");
    }
  }, [open]);

  if (!open) return null;

  async function sendMagicLink(e) {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setSentMsg("");
    try {
      const redirectTo =
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (error) throw error;
      setSentMsg("Magic link sent! Check your inbox.");
    } catch (err) {
      setSentMsg(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  async function sendSms(e) {
    e.preventDefault();
    if (!phone) return;
    setSmsError("");
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setSmsSent(true);
    } catch (err) {
      setSmsError(err.message || "Failed to send SMS.");
    } finally {
      setSending(false);
    }
  }

  async function verifySms(e) {
    e.preventDefault();
    if (!phone || !code) return;
    setSmsError("");
    setSending(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      onClose?.();
    } catch (err) {
      setSmsError(err.message || "Invalid code.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Log In or Sign Up</h3>
            <button
              className="rounded-md border px-2 py-1 text-sm"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-4 grid grid-cols-2 rounded-md bg-gray-100 p-1 text-sm">
            <button
              className={`rounded px-3 py-2 ${
                activeTab === "email" ? "bg-white shadow font-medium" : ""
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email
            </button>
            <button
              className={`rounded px-3 py-2 ${
                activeTab === "phone" ? "bg-white shadow font-medium" : ""
              }`}
              onClick={() => setActiveTab("phone")}
            >
              Phone
            </button>
          </div>

          {activeTab === "email" && (
            <form onSubmit={sendMagicLink} className="space-y-3">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border px-3 py-2"
              />
              <button
                type="submit"
                disabled={sending || !email}
                className="w-full rounded-md bg-[#13D4D4] py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send Magic Link"}
              </button>
              {!!sentMsg && (
                <p className="text-xs text-gray-600">{sentMsg}</p>
              )}
            </form>
          )}

          {activeTab === "phone" && (
            <div className="space-y-3">
              {!smsSent ? (
                <form onSubmit={sendSms} className="space-y-3">
                  <label className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+15551234567"
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={sending || !phone}
                    className="w-full rounded-md bg-[#13D4D4] py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Send Code"}
                  </button>
                  {!!smsError && (
                    <p className="text-xs text-red-600">{smsError}</p>
                  )}
                </form>
              ) : (
                <form onSubmit={verifySms} className="space-y-3">
                  <label className="block text-sm font-medium">
                    Enter Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-md border px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={sending || !code}
                    className="w-full rounded-md bg-[#13D4D4] py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  >
                    Verify & Continue
                  </button>
                  {!!smsError && (
                    <p className="text-xs text-red-600">{smsError}</p>
                  )}
                </form>
              )}
            </div>
          )}

          <p className="mt-4 text-center text-[11px] text-gray-500">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}