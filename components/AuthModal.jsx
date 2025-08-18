// components/AuthModal.jsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  // email
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // phone
  const [phone, setPhone] = useState("");         // E.164, e.g. +15551234567
  const [code, setCode] = useState("");           // 6-digit code
  const [codeSent, setCodeSent] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      // reset state when modal closes
      setActiveTab("email");
      setEmail("");
      setPhone("");
      setCode("");
      setCodeSent(false);
      setSmsSending(false);
      setEmailSending(false);
      setErrorMsg("");
    }
  }, [open]);

  if (!mounted) return null;
  if (!open) return null;

  const close = () => {
    if (onClose) onClose();
  };

  async function signInWithGoogle() {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
      });
      if (error) throw error;
    } catch (e) {
      setErrorMsg(e.message || "Google sign-in failed");
    }
  }

  async function sendEmailMagicLink(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!email) return;

    try {
      setEmailSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      alert("Magic link sent! Check your inbox.");
    } catch (e) {
      setErrorMsg(e.message || "Failed to send magic link");
    } finally {
      setEmailSending(false);
    }
  }

  async function sendSmsCode(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!phone || !phone.startsWith("+")) {
      setErrorMsg("Enter phone in E.164 format, e.g. +15551234567");
      return;
    }
    try {
      setSmsSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { channel: "sms" },
      });
      if (error) throw error;
      setCodeSent(true);
    } catch (e) {
      setErrorMsg(e.message || "Failed to send code");
    } finally {
      setSmsSending(false);
    }
  }

  async function verifySmsCode(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!phone || !code) return;

    try {
      setSmsSending(true);
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      close(); // success
    } catch (e) {
      setErrorMsg(e.message || "Invalid code");
    } finally {
      setSmsSending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Log In or Sign Up</h3>
          <button
            onClick={close}
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Google */}
        <div className="px-5 pt-5">
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-md bg-black px-4 py-3 text-white hover:opacity-90"
          >
            Continue with Google
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 px-5">
          <div className="flex rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
                activeTab === "email" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab("phone")}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
                activeTab === "phone" ? "bg-white shadow" : "text-gray-600"
              }`}
            >
              Phone
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {errorMsg ? (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          ) : null}

          {activeTab === "email" && (
            <form onSubmit={sendEmailMagicLink} className="space-y-3">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={emailSending}
                className="w-full rounded-md bg-[#13D4D4] px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {emailSending ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
          )}

          {activeTab === "phone" && (
            <form onSubmit={codeSent ? verifySmsCode : sendSmsCode} className="space-y-3">
              <label className="block text-sm font-medium">Phone (E.164)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15551234567"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              />

              {codeSent && (
                <>
                  <label className="block text-sm font-medium">Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={smsSending || (!phone && !codeSent)}
                className="w-full rounded-md bg-[#13D4D4] px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {smsSending ? "Please wait…" : codeSent ? "Verify Code" : "Send Code"}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            By continuing you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}