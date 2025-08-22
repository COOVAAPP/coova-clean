// components/AuthModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  // next path after auth
  const nextPath = useMemo(() => {
    const n = search.get("next");
    return n || pathname || "/";
  }, [pathname, search]);

  // Open when ?auth=1 is present
  useEffect(() => {
    if (search.get("auth") === "1") setOpen(true);
  }, [search]);

  // Also open when Header dispatches the global event
  useEffect(() => {
    const onOpen = (e) => {
      const next = e?.detail?.next;
      setOpen(true);

      // mirror to URL so refresh keeps state
      const url = new URL(window.location.href);
      url.searchParams.set("auth", "1");
      if (next) url.searchParams.set("next", next);
      router.replace(url.pathname + "?" + url.searchParams.toString());
    };
    window.addEventListener("open-auth", onOpen);
    return () => window.removeEventListener("open-auth", onOpen);
  }, [router]);

  // Close and clean URL
  const close = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("auth");
    router.replace(url.pathname + "?" + url.searchParams.toString());
  };

  // If user becomes logged in, close and redirect
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) {
        setOpen(false);
        const to = search.get("next") || "/";
        // clean the param
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        url.searchParams.delete("next");
        router.replace(to);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, search]);

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setSending(true);
    setToast("");
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setToast("Check your email for the login link.");
    } catch (err) {
      setToast(err.message || "Could not send link.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sign in</h2>
          <button
            onClick={close}
            className="rounded px-2 py-1 text-sm hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Continue to COOVA. You’ll be redirected to{" "}
          <span className="font-medium">{nextPath}</span>.
        </p>

        <button
          onClick={signInWithGoogle}
          className="mt-4 w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:text-black"
        >
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={sendMagicLink} className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-cyan-500"
          />
          <button
            disabled={sending}
            className="w-full rounded-md border px-4 py-2 font-bold hover:bg-gray-50 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {toast && (
          <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}