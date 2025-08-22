"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyAgeClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const next = params?.get("next") || "/";

  const onConfirm = async () => {
    setErr("");
    if (!checked) {
      setErr("You must confirm you are 18+ to continue.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id;
      if (!uid) {
        router.replace(`/auth?next=${encodeURIComponent(`/verify-age?next=${next}`)}`);
        return;
      }
      const { error } = await supabase.from("profiles").update({ is_adult: true }).eq("id", uid);
      if (error) throw error;

      router.push(next);
    } catch (e) {
      setErr("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Age Verification</h1>
      <p className="mt-4 text-gray-600">You must be 18 years or older to create a listing or book a space.</p>

      <div className="mt-6 flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input
          id="adult"
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <label htmlFor="adult" className="text-sm text-gray-800">
          I confirm that I am 18 years of age or older.
        </label>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

      <div className="mt-6">
        <button
          onClick={onConfirm}
          disabled={saving}
          className="rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </div>
    </main>
  );
}