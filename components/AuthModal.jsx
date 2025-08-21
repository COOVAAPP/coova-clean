"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleMagic = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus("Sending magic link…");
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    setStatus(error ? `Error: ${error.message}` : "Check your email for the login link!");
  };

  const handleGoogle = async () => {
    setBusy(true);
    // Redirect back to your app after Google auth
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    // If there is an error starting OAuth (rare), show it
    if (error) {
      setBusy(false);
      setStatus(`Error: ${error.message}`);
    }
    // Otherwise the browser redirects to Google; no further code runs here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-cyan-500">Sign in to COOVA</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black" disabled={busy}>
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full rounded-md border px-4 py-2 font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            {/* simple G icon */}
            <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden="true"><path fill="#EA4335" d="M533.5 278.4c0-18.6-1.7-36.5-5-53.8H272v101.8h147.3c-6.3 34.1-25.2 63-53.6 82.4v68h86.8c50.7-46.7 80-115.5 80-198.4z"/><path fill="#34A853" d="M272 544.3c72.6 0 133.6-24 178-65.4l-86.8-68c-24.1 16.2-55 25.8-91.2 25.8-69.9 0-129.1-47.2-150.3-110.7H32.3v69.6C76.3 491.7 168.3 544.3 272 544.3z"/><path fill="#4A90E2" d="M121.7 326c-10.4-30.9-10.4-64.1 0-95.1v-69.6H32.3c-40.2 80.4-40.2 174 0 254.4L121.7 326z"/><path fill="#FBBC05" d="M272 106.1c39.5-.6 77.5 13.7 106.5 39.9l80-80C409.1 23.7 343.8-.3 272 0 168.3 0 76.3 52.7 32.3 144.5l89.4 69.6C142.9 153.3 202.1 106.1 272 106.1z"/></svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleMagic} className="space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-md hover:bg-black hover:text-white disabled:opacity-70"
            >
              Send Magic Link
            </button>
          </form>

          {status && <p className="text-sm text-gray-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}