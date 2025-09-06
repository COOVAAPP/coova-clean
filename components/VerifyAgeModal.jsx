// components/VerifyAgeModal.jsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyAgeModal({ open, onClose, onVerified }) {
  const panelRef = useRef(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus first button when opened
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      panelRef.current?.querySelector("button")?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  const confirmAndPersist = useCallback(async () => {
    setError("");
    setPending(true);
    try {
      // 1) Always set a local flag so we don’t re-prompt on this device
      localStorage.setItem("age_verified", "true");

      // 2) If user is logged in, persist to profiles.age_verified (upsert to be safe)
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (uid) {
        const { error: upErr } = await supabase
          .from("profiles")
          .upsert({ id: uid, age_verified: true }, { onConflict: "id" });
        if (upErr) console.warn("profiles upsert failed (non-fatal):", upErr);
      }

      // 3) Notify parent & close
      onVerified?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Failed to update age verification.");
    } finally {
      setPending(false);
    }
  }, [onClose, onVerified]);

  if (!open) return null; // ✅ early return BEFORE any JSX

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onClose?.()}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-[92vw] max-w-md rounded-xl bg-white p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-title"
      >
        <button
          onClick={() => onClose?.()}
          className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l8 8M6 14L14 6" />
          </svg>
        </button>

        <h2 id="age-title" className="text-xl font-semibold text-gray-900">
          Are you 18 or older?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          You need to confirm you’re at least 18 years old to continue.
        </p>

        {error && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={confirmAndPersist}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Yes, I’m 18+"}
          </button>
          <button
            onClick={() => onClose?.()}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            No
          </button>
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          We only store a simple confirmation flag. No DOB is collected.
        </p>
      </div>
    </div>
  );
}