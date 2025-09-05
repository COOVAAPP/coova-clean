// components/Header.jsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Adjust paths if needed
import AuthModal from "./AuthModal.jsx";
import useRequireAuth from "../lib/useRequireAuth";
import { supabase } from "@/lib/supabaseClient";

/* ----------------------------------------------------------------
   Age Gate Modal
-----------------------------------------------------------------*/
function AgeGateModal({ open, onConfirm, onClose }) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!open) setChecked(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[92vw] max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-bold text-gray-900">Verify your age</h2>
        <p className="mt-2 text-sm text-gray-600">
          You must confirm you are <span className="font-semibold">18+</span> to continue.
        </p>

        <label className="mt-4 flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          I confirm I am at least 18 years old.
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-1.5 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!checked}
            onClick={onConfirm}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold text-white ${
              checked ? "bg-cyan-600 hover:bg-cyan-700" : "bg-cyan-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Header
-----------------------------------------------------------------*/
export default function Header() {
  const pathname = usePathname();

  // ===== Auth state & helpers from your hook =====
  const {
    user,
    requireAuth,
    authOpen, setAuthOpen,
    authTab, setAuthTab,
  } = useRequireAuth();

  // ===== Local UI =====
  const [mobileOpen, setMobileOpen] = useState(false);

  // ===== Age-gate =====
  const [ageOpen, setAgeOpen] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const pendingActionRef = useRef(null);      // "auth" | "list" | null
  const pendingAuthTabRef = useRef("signin"); // remember which auth tab to open

  // Read persisted age flag on mount
  useEffect(() => {
    try {
      const v = typeof window !== "undefined"
        ? window.localStorage.getItem("age_verified")
        : null;
      setAgeVerified(v === "1");
    } catch {
      setAgeVerified(false);
    }
  }, []);

  // Close mobile nav on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = useCallback(
    (href) => (pathname === href ? "text-white" : "text-white/80"),
    [pathname]
  );

  //...
  const checkAgeVerifiedAndGate = useCallback(async () => {
    try {
      const { data: { user } } = await supabase
        .from("profiles")
        .select("age_verified")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.warn("profile lookup failed", error);
        return;
      }

      if (profile?.age_verified) {
        localStorage.setItem("age_gate_ok", "1");
        setAgeGateOpen(false);
      } else {
        setAgeGateOpen(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [setAgeGateOpen]);
    


  /* ---------------------- DB sync helper ---------------------- */
  const syncAgeVerifiedToProfile = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) return;

      // Mark profile as age_verified=true (create row if missing)
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: uid, age_verified: true }, // include other cols only if you also want to update them
          { onConflict: "id" }
        );

      if (error) {
        // Not fatal; continue UX even if this fails
        console.warn("Failed to upsert age_verified to profiles:", error.message);
      }
    } catch (e) {
      console.warn("Age verify profile sync error:", e?.message || e);
    }
  }, []);

  /* ---------------- Age-gated entry points ------------------- */
  const openAuthGated = useCallback(
    (tab = "signin") => {
      if (!ageVerified) {
        pendingActionRef.current = "auth";
        pendingAuthTabRef.current = tab;
        setAgeOpen(true);
        return;
      }
      // age OK → open auth modal
      setAuthTab?.(tab);
      setAuthOpen?.(true);
    },
    [ageVerified, setAuthOpen, setAuthTab]
  );

  const onListYourSpace = useCallback(async () => {
    if (!ageVerified) {
      pendingActionRef.current = "list";
      setAgeOpen(true);
      return;
    }
    await requireAuth?.(() => {
      window.location.href = "/list/create";
    });
  }, [ageVerified, requireAuth]);

  // When age gate is confirmed, persist (local + DB if signed in) then continue action
  const onAgeConfirmed = useCallback(async () => {
    try {
      window.localStorage.setItem("age_verified", "1");
    } catch {}
    setAgeVerified(true);
    setAgeOpen(false);

    // If already signed in, immediately sync to DB (best effort)
    await syncAgeVerifiedToProfile();

    const action = pendingActionRef.current;
    pendingActionRef.current = null;

    if (action === "auth") {
      setAuthTab?.(pendingAuthTabRef.current || "signin");
      setAuthOpen?.(true);
    } else if (action === "list") {
      requireAuth?.(() => (window.location.href = "/list/create"));
    }
  }, [requireAuth, setAuthOpen, setAuthTab, syncAgeVerifiedToProfile]);

  // After a *new* sign-in, if localStorage says age_verified=1, sync to DB once
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (session?.user) {
        try {
          const v = window.localStorage.getItem("age_verified");
          if (v === "1") {
            await syncAgeVerifiedToProfile();
          }
        } catch {}
      }
    });
    return () => sub?.data?.subscription?.unsubscribe?.();
  }, [syncAgeVerifiedToProfile]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAgeVerifiedAndGate();
      } else {
        setAgeGateOpen(false);
      }
    });
    return () => sub.subscription?.unsubscribe?.();
  }, [checkAgeVerifiedAndGate]);

  
  // Desktop auth label
  const authButtonLabel = useMemo(() => (user ? "Account" : "Sign in / Sign up"), [user]);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-cyan-500/90 backdrop-blur supports-[backdrop-filter]:bg-cyan-500/70 border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Brand + mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 outline-none"
                aria-label="Open navigation"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/" className="font-extrabold tracking-wide text-2xl text-white">
                COOVA
              </Link>
            </div>

            {/* Center nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/browse"
                className={`text-sm font-medium transition hover:text-white ${isActive("/browse")}`}
              >
                Browse
              </Link>

              <button
                type="button"
                onClick={onListYourSpace}
                className="rounded-full border-2 border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                List your space
              </button>
            </nav>

            {/* Right auth (desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuthGated("signin")}
                  className="rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  {authButtonLabel}
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-full border-2 border-white px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right auth (mobile quick) */}
            <div className="sm:hidden flex items-center">
              {!user ? (
                <button
                  type="button"
                  onClick={() => openAuthGated("signin")}
                  className="rounded-full border-2 border-white px-3 py-1 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Sign in
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="rounded-full border-2 border-white px-3 py-1 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-cyan-600/90 backdrop-blur">
            <div className="mx-auto w-full max-w-7xl px-4 py-3 flex flex-col gap-2">
              <Link
                href="/browse"
                className={`block rounded-md px-3 py-2 text-base font-medium hover:bg-white/10 ${isActive("/browse")}`}
              >
                Browse
              </Link>

              <button
                type="button"
                onClick={onListYourSpace}
                className="block text-left rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
              >
                List your space
              </button>

              {!user ? (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthGated("signin")}
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthGated("signup")}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-white/90"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="mt-1 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AgeGateModal
        open={ageOpen}
        onClose={() => { pendingActionRef.current = null; setAgeOpen(false); }}
        onConfirm={onAgeConfirmed}
      />

      <AuthModal
        open={!!authOpen}
        onClose={() => setAuthOpen?.(false)}
        defaultTab={authTab || "signin"}
      />
    </>
  );
}