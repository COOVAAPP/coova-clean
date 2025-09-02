// components/VerifyAgeModal.jsx
"use client";

import { useState } from "react";

export default function VerifyAgeModal({ open, onClose, onVerified }) {
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => onClose?.()} />
      <div className="relative z-10 w-[92vw] max-w-md rounded-xl bg-white p-5 shadow-2xl">
        <h2 className="text-lg font-bold">Age verification</h2>
        <p className="mt-2 text-sm text-gray-600">
          You must be 18 or older to use Coova. Please confirm below.
        </p>

        {err && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <label className="mt-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I confirm that I am 18 years of age or older.</span>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => onClose?.()}
            className="rounded-md border px-4 py-1.5 text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!checked || saving}
            onClick={async () => {
              setErr("");
              setSaving(true);
              try {
                await onVerified?.(); // parent decides what "verified" means
              } catch (e) {
                setErr(e?.message || "Could not save verification.");
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-md bg-cyan-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}