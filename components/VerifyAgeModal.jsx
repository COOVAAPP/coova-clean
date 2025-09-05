// components/VerifyAgeModal.jsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyAgeModal({ open, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1) Always set a local flag so we don’t re-prompt
      localStorage.setItem("age_gate_ok", "1");

      // 2) If user is signed in, persist to profiles.age_verified
      const { data: { user } = {}, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user?.id) {
        // profiles.id should equal auth.uid()
        const { error: upErr } = await supabase
          .from("profiles")
          .update({ age_verified: true })
          .eq("id", user.id);

        // Non-fatal: if RLS blocks or row missing, just continue
        if (upErr) {
          // You can console.log(upErr) if you want to inspect
        }
      }

      // 3) Notify parent & close
      if (typeof onConfirm === "function") onConfirm();
      if (typeof onClose === "function") onClose();
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (typeof onClose === "function") onClose();
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />
      <div className="relative mx-2 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-gray-900">Are you 18 or older?</h2>
        <p className="mt-2 text-sm text-gray-600">
          You must be 18+ to use COOVA. Please confirm to continue.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Yes, I’m 18+"}
          </button>
        </div>
      </div>
    </div>
  );
}