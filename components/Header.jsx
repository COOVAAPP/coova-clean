"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // mobile nav
  const [open, setOpen] = useState(false);

  // auth modal
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("phone");

  // forms
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // E.164 format: +15551234567
  const [code, setCode] = useState("");   // OTP from SMS

  // ui state
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);

  // keep session in header so we can swap "Login" for "Logout"
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess ?? null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  function closeModal() {
    setShowModal(false);
    setMessage("");
    setSending(false);
    setVerifying(false);
    setCode("");
  }

  async function handleEmailLogin() {
    try {
      setSending(true);
      setMessage("");
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;

      setMessage("Check your email for the login link.");
    } catch (err) {
      setMessage(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  async function handlePhoneLogin() {
    try {
      setSending(true);
      setMessage("");
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
      });
      if (error) throw error;
      setMessage("We sent you a code via SMS. Enter it below to verify.");
    } catch (err) {
      setMessage(err.message || "Failed to send code.");
    } finally {
      setSending(false);
    }
  }

  async function verifyPhoneOtp() {
    try {
      setVerifying(true);
      setMessage("");
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: code.trim(),
        type: "sms",
      });
      if (error) throw error;

      setMessage("You’re signed in!");
      // close and refresh UI
      setTimeout(() => {
        closeModal();
        router.refresh();
      }, 600);
    } catch (err) {
      setMessage(err.message || "Invalid code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  // Close modal on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  return (
    <header
      className="
        sticky top-0 z-40 border-b border-black/10
        bg-[#9EFCFF] supports-[backdrop-filter]:bg-[#9EFCFF]/90
        backdrop-blur
      "
    >
      <div className="container-page h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-5xl font-bold text-white tracking-wide">COOVA</Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>

          {!session ? (
            <button
              onClick={() => setShowModal(true)}
              className="hover:opacity-80"
            >
              Login / Sign Up
            </button>
          ) : (
            <button onClick={handleLogout} className="hover:opacity-80">
              Logout
            </button>
          )}

          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle Menu"
        >
          <span className="i-lucide-menu h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-black/10 bg-[#9EFCFF]">
          <nav className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link href="/browse" className="py-1" onClick={() => setOpen(false)}>
              Browse
            </Link>

            {!session ? (
              <button
                className="py-1 text-left"
                onClick={() => {
                  setOpen(false);
                  setShowModal(true);
                }}
              >
                Login / Sign Up
              </button>
            ) : (
              <button className="py-1 text-left" onClick={handleLogout}>
                Logout
              </button>
            )}

            <Link href="/list" className="py-1" onClick={() => setOpen(false)}>
              List Your Space
            </Link>
          </nav>
        </div>
      )}

      {/* AUTH MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Log In or Sign Up
            </h3>

            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                className={`flex-1 py-2 ${activeTab === "phone" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
                onClick={() => setActiveTab("phone")}
              >
                Phone
              </button>
              <button
                className={`flex-1 py-2 ${activeTab === "email" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
                onClick={() => setActiveTab("email")}
              >
                Email
              </button>
            </div>

            {/* Phone tab */}
            {activeTab === "phone" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  onClick={handlePhoneLogin}
                  disabled={sending || !phone.trim()}
                  className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send Code"}
                </button>

                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium">Enter Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full border rounded px-3 py-2"
                  />
                  <button
                    onClick={verifyPhoneOtp}
                    disabled={verifying || !code.trim()}
                    className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                  >
                    {verifying ? "Verifying…" : "Verify & Continue"}
                  </button>
                </div>
              </div>
            )}

            {/* Email tab */}
            {activeTab === "email" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border rounded px-3 py-2"
                />
                <button
                  onClick={handleEmailLogin}
                  disabled={sending || !email.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send Magic Link"}
                </button>
                <p className="text-xs text-gray-500">
                  We’ll email you a sign-in link. No password needed.
                </p>
              </div>
            )}

            {/* Message */}
            {message && (
              <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
            )}

            {/* “See more options” (swap tabs) */}
            <div className="mt-4 text-center">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  setActiveTab((t) => (t === "phone" ? "email" : "phone"))
                }
              >
                {activeTab === "phone" ? "Use email instead" : "Use phone instead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}