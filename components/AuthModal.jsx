"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link.");
    }
    setLoading(false);
  }

  // Handle redirect feedback
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (sess) {
        const pendingList = localStorage.getItem("redirectToList");
        setRedirecting(true);

        setMessage(
          pendingList ? "Redirecting to list…" : "Redirecting to homepage…"
        );
      }
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Sign in to COOVA</h2>

        {redirecting ? (
          <p className="text-center text-green-600 font-medium">{message}</p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded-md hover:opacity-90"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </form>
        )}

        {message && !redirecting && (
          <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}