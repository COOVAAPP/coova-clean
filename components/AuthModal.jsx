// components/AuthModal.jsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Supabase loader: tries a few common paths so this file is portable.
   If none work, we surface a helpful error banner in the UI.
   ──────────────────────────────────────────────────────────────────────────── */
async function loadSupabase() {
  const candidates = [
    // [path, getter]
    ["../lib/supabaseClient", (m) => m.supabase ?? m.default],
    ["../lib/supabaseBrowser", (m) => m.supabase ?? m.default],
    ["./supabaseClient", (m) => m.supabase ?? m.default],
    ["./supabaseBrowser", (m) => m.supabase ?? m.default],
  ];

  for (const [path, pick] of candidates) {
    try {
      const mod = await import(/* @vite-ignore */ path);
      const client = pick(mod);
      if (client) return client;
    } catch {
      // keep trying next path
    }
  }
  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
   Focus trap + scroll lock helpers (no external libs)
   ──────────────────────────────────────────────────────────────────────────── */
function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

function useFocusTrap(active, containerRef) {
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    const focusable = node.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKey = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    first?.focus();
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [active, containerRef]);
}

/* ────────────────────────────────────────────────────────────────────────────
   Tiny UI helpers
   ──────────────────────────────────────────────────────────────────────────── */
function Field({ label, type = "text", value, onChange, autoComplete, name }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none ring-0 focus:border-cyan-500"
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </div>
  );
}

function Divider({ children = "OR" }) {
  return (
    <div className="relative my-4">
      <div className="h-px w-full bg-gray-200" />
      <div className="absolute inset-0 -top-3 flex items-center justify-center">
        <span className="bg-white px-2 text-xs uppercase tracking-wide text-gray-500">
          {children}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────────────────── */
export default function AuthModal({
  open,
  onClose,
  defaultTab = "signin", // "signin" | "signup"
}) {
  const [tab, setTab] = useState(defaultTab);
  const [supabase, setSupabase] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const panelRef = useRef(null);
  useScrollLock(open);
  useFocusTrap(open, panelRef);

  // keep tab in sync if parent changes the default
  useEffect(() => setTab(defaultTab), [defaultTab]);

  // Load Supabase client lazily on first open
  useEffect(() => {
    let mounted = true;
    if (!open || supabase) return;

    (async () => {
      const client = await loadSupabase();
      if (!mounted) return;
      if (!client) {
        setLoadErr(
          "Could not locate Supabase browser client. Update loadSupabase() paths."
        );
      } else {
        setSupabase(client);
        setLoadErr("");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, supabase]);

  // Close on ESC / overlay click
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSubmit = useMemo(() => {
    if (pending) return false;
    if (!email || !pw) return false;
    if (tab === "signup" && pw !== confirmPw) return false;
    return true;
  }, [pending, email, pw, confirmPw, tab]);

  const withPending = useCallback(
    async (fn) => {
      setErr("");
      setInfo("");
      setPending(true);
      try {
        await fn();
      } catch (e) {
        const msg =
          e?.message ||
          e?.error_description ||
          (typeof e === "string" ? e : "Something went wrong");
        setErr(msg);
      } finally {
        setPending(false);
      }
    },
    []
  );

  const doEmailPassword = useCallback(async () => {
    if (!supabase) {
      setErr(
        "Supabase client not ready. If this persists, check the import paths in AuthModal."
      );
      return;
    }

    if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (error) throw error;
      onClose?.();
      // If your app relies on server layouts reading cookies, a hard reload is safest:
      window.location.reload();
    } else {
      // signup
      if (pw.length < 6) throw new Error("Password must be at least 6 characters.");
      if (pw !== confirmPw) throw new Error("Passwords do not match.");

      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });
      if (error) throw error;
      setInfo("Check your email to confirm your account.");
      setTab("signin");
      setPw("");
      setConfirmPw("");
    }
  }, [supabase, tab, email, pw, confirmPw, onClose]);

  const doGoogle = useCallback(async () => {
    if (!supabase) {
      setErr(
        "Supabase client not ready. If this persists, check the import paths in AuthModal."
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
    // Redirect happens automatically
  }, [supabase]);

  const doResetPassword = useCallback(async () => {
    if (!supabase) {
      setErr(
        "Supabase client not ready. If this persists, check the import paths in AuthModal."
      );
      return;
    }
    if (!email) {
      setErr("Enter your email above first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
    });
    if (error) throw error;
    setInfo("Password reset email sent (if an account exists).");
  }, [supabase, email]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onClose?.()}
      />

      {/* panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-[92vw] max-w-md rounded-xl bg-white p-4 shadow-2xl sm:p-6"
      >
        {/* close */}
        <button
          onClick={() => onClose?.()}
          className="absolute right-3 top-3 rounded p-1 text-gray-500 outline-none hover:bg-gray-100"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l8 8M6 14L14 6" />
          </svg>
        </button>

        {/* title */}
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {tab === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mb-3 text-sm text-gray-500">
          {tab === "signin"
            ? "Sign in to continue."
            : "Sign up to start listing or booking spaces."}
        </p>

        {/* tabs */}
        <div className="mb-4 inline-flex rounded-md border border-gray-200 bg-gray-100 p-1 text-sm">
          <button
            onClick={() => setTab("signin")}
            className={`rounded px-3 py-1 ${
              tab === "signin" ? "bg-white shadow-sm" : "text-gray-600"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`rounded px-3 py-1 ${
              tab === "signup" ? "bg-white shadow-sm" : "text-gray-600"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Supabase load error banner (shows when client not found) */}
        <ErrorBanner>{loadErr}</ErrorBanner>
        {loadErr && <div className="mt-3" />}

        {/* error / info */}
        {err && (
          <div className="mb-3">
            <ErrorBanner>{err}</ErrorBanner>
          </div>
        )}
        {info && (
          <div className="mb-3 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
            {info}
          </div>
        )}

        {/* form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            withPending(doEmailPassword);
          }}
        >
          <div className="grid gap-3">
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              value={pw}
              onChange={setPw}
            />
            {tab === "signup" && (
              <Field
                label="Confirm Password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={setConfirmPw}
            />
            )}

            {tab === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-cyan-700 hover:underline"
                  onClick={() => withPending(doResetPassword)}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`mt-1 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition ${
                canSubmit
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "cursor-not-allowed bg-cyan-300"
              }`}
            >
              {pending
                ? "Please wait…"
                : tab === "signin"
                ? "Sign in"
                : "Create account"}
            </button>
          </div>
        </form>

        <Divider />

        {/* providers */}
        <div className="grid gap-2">
          <button
            onClick={() => withPending(doGoogle)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {/* G icon */}
            <svg viewBox="0 0 533.5 544.3" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#4285f4"
                d="M533.5 278.4c0-18.6-1.5-37-4.6-54.8H272v103.8h147.1c-6.4 34.5-26.1 63.7-55.7 83.2v68h90.2c52.7-48.5 80.9-120.1 80.9-200.2z"
              />
              <path
                fill="#34a853"
                d="M272 544.3c73.4 0 135.1-24.3 180.1-65.7l-90.2-68c-25 17-57.1 27-89.9 27-68.9 0-127.3-46.5-148.2-108.8h-93.4v68.7C75.6 485.8 167.8 544.3 272 544.3z"
              />
              <path
                fill="#fbbc04"
                d="M123.8 328.8c-9.2-27.4-9.2-57 0-84.4v-68.7h-93.4C-15 231.1-15 313.2 30.4 372.9l93.4-68.7z"
              />
              <path
                fill="#ea4335"
                d="M272 106c39.8-.6 78.3 14.2 107.7 41.8l80.5-80.5C408.7 22.6 339.6-.2 272 0 167.8 0 75.6 58.5 30.4 156.5l93.4 68.7C144.8 152.5 203.1 106 272 106z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* tos */}
        <p className="mt-4 text-center text-[11px] text-gray-500">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-cyan-700 hover:underline">
            Terms
          </a>{" "}
          &{" "}
          <a href="/privacy" className="text-cyan-700 hover:underline">
            Privacy
          </a>
          .
        </p>
      </div>
    </div>
  );
}