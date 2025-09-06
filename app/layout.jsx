// app/layout.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import VerifyAgeModal from "@/components/VerifyAgeModal"; // ← make sure this exists
import "./globals.css";

export default function RootLayout({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  // age gate state
  const [ageGateOpen, setAgeGateOpen] = useState(false);
  // store the tab we *wanted* to open (signin/signup) until age gate passes
  const pendingTabRef = useRef("signin");

  // Expose a single, global opener the Header (and others) can call.
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__COOVA_OPEN_AUTH__ = (tab = "signin") => {
      pendingTabRef.current = tab;

      try {
        const ok = localStorage.getItem("age_gate_ok") === "1";
        if (ok) {
          setAuthTab(tab);
          setAuthOpen(true);
        } else {
          setAgeGateOpen(true);
        }
      } catch {
        // If localStorage isn’t available, fall back to showing the gate.
        setAgeGateOpen(true);
      }
    };

    return () => {
      delete window.__COOVA_OPEN_AUTH__;
    };
  }, []);

  // called when user confirms they are 18+
  const handleAgeVerified = () => {
    try {
      localStorage.setItem("age_gate_ok", "1");
    } catch {}
    setAgeGateOpen(false);
    setAuthTab(pendingTabRef.current || "signin");
    setAuthOpen(true);
  };

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        {/* Auth modal can be triggered globally via window.__COOVA_OPEN_AUTH__ */}
        <AuthModal
          open={authOpen}
          defaultTab={authTab}
          onClose={() => setAuthOpen(false)}
        />

        {/* Age gate appears *before* auth if not acknowledged */}
        <VerifyAgeModal
          open={ageGateOpen}
          onClose={() => setAgeGateOpen(false)}
          onConfirm={handleAgeVerified}
        />

        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}