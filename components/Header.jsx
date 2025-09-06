"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import VerifyAgeModal from "./VerifyAgeModal";

export default function Header() {
  const [ageGateOpen, setAgeGateOpen] = useState(false);
  const [queuedAuthTab, setQueuedAuthTab] = useState("signin");

  // convenience helper to open your global AuthModal (provided by RootLayout)
  const openAuth = useCallback((tab = "signin") => {
    if (typeof window !== "undefined" && typeof window.__COOVA_OPEN_AUTH__ === "function") {
      window.__COOVA_OPEN_AUTH__(tab);
    }
  }, []);

  // When user clicks “Sign in / Sign up”, check local flag; if missing, open age gate first
  const handleAuthClick = useCallback((tab = "signin") => {
    try {
      const ok = typeof window !== "undefined" && localStorage.getItem("age_verified") === "true";
      if (ok) {
        openAuth(tab);
      } else {
        setQueuedAuthTab(tab);
        setAgeGateOpen(true);
      }
    } catch {
      // if localStorage not available, just show the gate
      setQueuedAuthTab(tab);
      setAgeGateOpen(true);
    }
  }, [openAuth]);

  // After age verified, open the Auth modal with the queued tab
  const handleAgeVerified = useCallback(() => {
    // local flag is already set by the modal; just proceed
    openAuth(queuedAuthTab || "signin");
  }, [openAuth, queuedAuthTab]);

  // Expose helpers for other parts of the app if needed
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__COOVA_OPEN_SIGNIN__ = () => handleAuthClick("signin");
    window.__COOVA_OPEN_SIGNUP__  = () => handleAuthClick("signup");
    return () => {
      delete window.__COOVA_OPEN_SIGNIN__;
      delete window.__COOVA_OPEN_SIGNUP__;
    };
  }, [handleAuthClick]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b">
        <div className="container-page flex items-center justify-between py-3 gap-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="font-extrabold tracking-tight text-cyan-600">
              COOVA
            </Link>
            <nav className="hidden sm:flex items-center gap-3 text-sm">
              <Link href="/browse" className="rounded px-3 py-1 hover:bg-gray-100">Browse</Link>
              <Link
                href="/list/create"
                className="rounded-full border px-3 py-1 font-semibold hover:bg-gray-50"
              >
                List your space
              </Link>
            </nav>
          </div>

          {/* Right: Auth buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAuthClick("signin")}
              className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => handleAuthClick("signup")}
              className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Sign up
            </button>

            {/* Optional: Dashboard quick link (keep if you want it always visible) */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Age gate modal – opens before Auth */}
      <VerifyAgeModal
        open={ageGateOpen}
        onClose={() => setAgeGateOpen(false)}
        onVerified={handleAgeVerified}
      />
    </>
  );
}