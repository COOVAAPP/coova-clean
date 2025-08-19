"use client";

import { useEffect, useState } from "react";

/**
 * Props:
 *  - onClose?: () => void
 */
export default function AuthModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === "email") {
      // TODO: Hook to Supabase email magic link or OAuth
      console.log("Email login:", email);
    } else {
      // TODO: Hook to Supabase SMS (Twilio) OTP
      console.log("Phone login:", phone);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onClose && onClose()}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Close */}
        <button
          onClick={() => onClose && onClose()}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center text-2xl font-bold text-brand-600">
          Sign in to COOVA
        </h2>

        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "email"
                ? "bg-white text-brand-600 shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("phone")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              activeTab === "phone"
                ? "bg-white text-brand-600 shadow"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Phone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "email" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1234"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                SMS sign-in requires Twilio + Supabase SMS to be configured.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-brand-500 hover:text-brand-600">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-brand-500 hover:text-brand-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}