// components/AuthModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function Field({ id, label, type = "text", value, onChange, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
      />
    </div>
  );
}

export default function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const open = params?.get("auth") === "1";
  const modeParam = params?.get("mode");
  const startMode = modeParam === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState(startMode);
  const next = params?.get("next") || "/";

  // auth method: "magic" or "password"
  const [method, setMethod] = useState("magic");

  // form state
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMode(modeParam === "signup" ? "signup" : "signin");
  }, [modeParam]);

  // If user becomes logged-in, continue to next
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data?.session) goNext();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) goNext();
    });
    return () => sub?.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);

  const goNext = () => {
    router.replace(next);
  };

  const close = () => {
    const sp = new URLSearchParams(params?.toString() || "");
    sp.delete("auth");
    sp.delete("mode");
    sp.delete("next");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const switchTab = (m) => {
    const sp = new URLSearchParams(params?.toString() || "");
    sp.set("auth", "1");
    sp.set("mode", m);
    if (!sp.get("next")) sp.set("next", next);
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const title = useMemo(
    () => (mode === "signup" ? "Create your account" : "Welcome back"),
    [mode]
  );

  const onOAuth = async (provider) => {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const redirectTo = `${location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) throw error;
      // user will be redirected out and back
    } catch (e) {
      setErr(e.message || "OAuth failed.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      const redirectTo = `${location.origin}/auth/callback`;

      if (method === "magic") {
        if (!email) throw new Error("Email is required.");
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({ email, options: { emailRedirectTo: redirectTo }});
          if (error) throw error;
          setMsg("Check your email to confirm and finish creating your account.");
        } else {
          const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo }});
          if (error) throw error;
          setMsg("Check your email for the magic link.");
        }
        return;
      }

      // password method
      if (!email || !pw) throw new Error("Email and password are required.");
      if (mode === "signup") {
        if (pw.length < 6) throw new Error("Password must be at least 6 characters.");
        if (pw !== pw2) throw new Error("Passwords do not match.");
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        setMsg("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        // signed in → onAuthStateChange will route to next
      }
    } catch (e2) {
      setErr(e2.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={close}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
          <button
            onClick={close}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <button
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              mode === "signin" ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => switchTab("signin")}
          >
            Sign in
          </button>
          <button
            className={`rounded-md px-3 py-1 text-sm font-semibold ${
              mode === "signup" ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => switchTab("signup")}
          >
            Sign up
          </button>
        </div>

        {/* Method toggle */}
        <div className="mt-3 flex gap-2">
          <button
            className={`rounded-md px-2 py-1 text-xs ${
              method === "magic" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setMethod("magic")}
          >
            Magic link
          </button>
          <button
            className={`rounded-md px-2 py-1 text-xs ${
              method === "password" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setMethod("password")}
          >
            Email + Password
          </button>
        </div>

        {/* OAuth */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            disabled={busy}
            onClick={() => onOAuth("google")}
            className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Continue with Google
          </button>
          <button
            disabled={busy}
            onClick={() => onOAuth("apple")}
            className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Continue with Apple
          </button>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
          {method === "password" && (
            <>
              <Field id="pw" label="Password" type="password" value={pw} onChange={setPw} autoComplete="current-password" />
              {mode === "signup" && (
                <Field id="pw2" label="Confirm password" type="password" value={pw2} onChange={setPw2} autoComplete="new-password" />
              )}
            </>
          )}

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
          >
            {busy
              ? "Working…"
              : mode === "signup"
              ? method === "magic"
                ? "Send sign-up link"
                : "Create account"
              : method === "magic"
              ? "Send magic link"
              : "Sign in"}
          </button>

          <p className="text-xs text-gray-500">
            After completing {mode === "signup" ? "sign up" : "sign in"}, you’ll return to{" "}
            <span className="font-mono">{next}</span>.
          </p>
        </form>
      </div>
    </div>
  );
}