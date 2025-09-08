// app/layout.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import VerifyAgeModal from "@/components/VerifyAgeModal"; // ⬅️ add this import
import "./globals.css";

export default function RootLayout({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  // age modal state
  const [ageOpen, setAgeOpen] = useState(false);
  const ageResolveRef = useRef(null); // holds the callback we’ll run after “Yes, I’m 18+”

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Allow anything (Header, buttons) to open Auth
    window.__COOVA_OPEN_AUTH__ = (tab = "signin") => {
      setAuthTab(tab);
      setAuthOpen(true);
    };

    // Allow anything to open the Age modal and provide a callback when confirmed
    window.__COOVA_OPEN_AGE__ = (onVerified) => {
      ageResolveRef.current = typeof onVerified === "function" ? onVerified : null;
      setAgeOpen(true);
    };

    return () => {
      delete window.__COOVA_OPEN_AUTH__;
      delete window.__COOVA_OPEN_AGE__;
    };
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />

        {/* Auth modal (unchanged) */}
        <AuthModal
          open={authOpen}
          defaultTab={authTab}
          onClose={() => setAuthOpen(false)}
        />

        {/* Age modal (new) */}
        <VerifyAgeModal
          open={ageOpen}
          onClose={() => {
            setAgeOpen(false);
            ageResolveRef.current = null; // canceled
          }}
          onVerified={() => {
            setAgeOpen(false);
            // run the waiting callback (e.g., then open Auth)
            const cb = ageResolveRef.current;
            ageResolveRef.current = null;
            try { cb && cb(); } catch {}
          }}
        />

        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}