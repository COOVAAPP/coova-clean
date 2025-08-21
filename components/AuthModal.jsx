// components/AuthModal.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal() {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  // open when ?auth=1
  useEffect(() => {
    setOpen(params.get("auth") === "1");
  }, [params]);

  // util: where to go after login
  const getNext = () => params.get("next") || "/";

  // close modal AND strip query (?auth & ?next)
  const closeAndClean = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    url.searchParams.delete("next");
    router.replace(url.pathname + (url.search ? url.search : "") + url.hash);
  };

  // handle success nav
  const goNext = () => router.push(getNext());

  // Magic link
  const sendLink = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMsg("Check your email for the magic link.");
    } catch (err) {
      setMsg(err.message || "Could not send link.");
    } finally {
      setSending(false);
    }
  };

  // Google OAuth
  const signInGoogle = async () => {
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // page will redirect; in case of popup flow you can still fall back:
      // goNext();
    } catch (err) {
      setMsg(err.message || "Google sign-in failed.");
      setSending(false);
    }
  };

  // if user logs in while modal open → advance
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        closeAndClean();
        goNext();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sign in</h2>
          <button
            onClick={closeAndClean}
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <button
            onClick={signInGoogle}
            disabled={sending}
            className="w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            Continue with Google
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={sendLink} className="space-y-3">
            <label className="block text-sm font-bold">Login</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-md border px-3 font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                Send magic link
              </button>
            </div>
          </form>

          {msg && (
            <p className="text-sm text-gray-600">
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}