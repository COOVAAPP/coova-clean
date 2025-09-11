// components/ClientShell.jsx (CLIENT COMPONENT)
// Moves your previous client-only logic here from the old app/layout.jsx

"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function ClientShell({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("signin");

  // Global opener used by Header (and elsewhere)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__COOVA_OPEN_AUTH__ = (tab = "signin") => {
      setAuthTab(tab);
      setAuthOpen(true);
    };
    return () => {
      delete window.__COOVA_OPEN_AUTH__;
    };
  }, []);

  return (
    <>
      <Header />
      <AuthModal open={authOpen} defaultTab={authTab} onClose={() => setAuthOpen(false)} />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  );
}