// components/LoginModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginModal({ open, onClose }) {
  const [showMore, setShowMore] = useState(false);       // "See more options"
  const [tab, setTab] = useState("phone");               // 'phone' | 'email'

  // Phone state
  const [phone, setPhone] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const phoneDisabled = useMemo(
    () => !phone.trim().startsWith("+") || phoneLoading,
    [phone, phoneLoading]
  );

  // Email state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");        // Optional if you enable Email OTP
  const [emailLoading, setEmailLoading] = useState(false);
  const emailDisabled = useMemo(
    () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || emailLoading,
    [email, emailLoading]
  );

  useEffect(() => {
    if (!open) {
      // reset when closed
      setShowMore(false);
      setTab("phone");
      setPhone("");
      setPhoneSent(false);
      setPhoneCode("");
      setPhoneLoading(false);
      setEmail("");
      setEmailSent(false);
      setEmailCode("");
      setEmailLoading(false);
    }
  }, [open]);

  async function sendPhoneOtp(e) {
    e?.preventDefault?.();
    if (phoneDisabled) return;
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setPhoneSent(true);
    } catch (err) {
      alert(err.message || "Failed to send SMS.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function verifyPhoneOtp(e) {
    e?.preventDefault?.();
    if (!phoneCode.trim()) return;
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: phoneCode.trim(),
        type: "sms",
      });
      if (error) throw error;
      onClose?.();
    } catch (err) {
      alert(err.message || "Invalid code.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function sendEmailLink(e) {
    e?.preventDefault?.();
    if (emailDisabled) return;
    setEmailLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err) {
      alert(err.message || "Failed to send email.");
    } finally {
      setEmailLoading(false);
    }
  }

  // Optional: If you enable "Email OTP" instead of Magic Link, use this:
  async function verifyEmailOtp(e) {
    e?.preventDefault?.();
    if (!emailCode.trim()) return;
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: emailCode.trim(),
        type: "email",
      });
      if (error) throw error;
      onClose?.();
    } catch (err) {
      alert(err.message || "Invalid code.");
    } finally {
      setEmailLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Log In or Sign Up</h3>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {showMore ? (
          <div className="mt-4 grid grid-cols-2 rounded-md bg-gray-100 p-1 text-sm">
            <button
              onClick={() => setTab("phone")}
              className={`rounded-md py-2 ${
                tab === "phone" ? "bg-white font-semibold shadow" : "opacity-70"
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => setTab("email")}
              className={`rounded-md py-2 ${
                tab === "email" ? "bg-white font-semibold shadow" : "opacity-70"
              }`}
            >
              Email
            </button>
          </div>
        ) : (
          <div className="mt-2 text-right">
            <button
              onClick={() => setShowMore(true)}
              className="text-sm text-brand-600 hover:underline"
            >
              See more options
            </button>
          </div>
        )}

        {/* BODY */}
        <div className="mt-4">
          {/* PHONE TAB */}
          {(tab === "phone" || !showMore) && (
            <form className="space-y-3" onSubmit={phoneSent ? verifyPhoneOtp : sendPhoneOtp}>
              {!phoneSent ? (
                <>
                  <label className="block text-sm font-medium">Phone Number</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="+15551234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                  />
                  <button
                    type="submit"
                    disabled={phoneDisabled}
                    className="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {phoneLoading ? "Sending…" : "Continue"}
                  </button>
                  {showMore && (
                    <p className="text-center text-xs text-gray-500">
                      We’ll send a verification code by SMS.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium">Enter SMS Code</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="123456"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    inputMode="numeric"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:opacity-90"
                  >
                    {phoneLoading ? "Verifying…" : "Verify & Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={sendPhoneOtp}
                    className="w-full rounded-md border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Resend Code
                  </button>
                </>
              )}
            </form>
          )}

          {/* EMAIL TAB */}
          {showMore && tab === "email" && (
            <form className="mt-1 space-y-3" onSubmit={sendEmailLink}>
              <label className="block text-sm font-medium">Email Address</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
              />
              {!emailSent ? (
                <button
                  type="submit"
                  disabled={emailDisabled}
                  className="w-full rounded-md bg-brand-600 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {emailLoading ? "Sending…" : "Send Magic Link"}
                </button>
              ) : (
                <>
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                    Magic link sent. Check your email.
                  </div>
                  {/* If you enable Email OTP: */}
                  {/* <label className="block text-sm font-medium">Or enter code</label>
                  <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="6-digit code"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    className="w-full rounded-md border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Verify Code
                  </button> */}
                </>
              )}
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to COOVA’s Terms & Privacy.
        </p>
      </div>
    </div>
  );
}