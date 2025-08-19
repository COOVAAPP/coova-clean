// app/verify-sms/VerifySmsClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function VerifySmsClient() {
  const router = useRouter();
  const params = useSearchParams();

  const phoneFromQuery = params.get("phone") || "";
  const redirect = params.get("redirect") || "/";

  const [phone, setPhone] = useState(phoneFromQuery);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setPhone(phoneFromQuery);
  }, [phoneFromQuery]);

  const canVerify = useMemo(() => {
    if (!phone?.trim()) return false;
    if (!code?.trim()) return false;
    return true;
  }, [phone, code]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canVerify || loading) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      // Verify OTP sent by Supabase SMS
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: code,
        type: "sms",
      });

      if (error) throw error;

      setMsg("Phone verified. Redirecting…");
      setTimeout(() => router.replace(redirect), 600);
    } catch (e) {
      setErr(e?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
      >
        <h1 className="mb-4 text-xl font-semibold">Verify Phone</h1>

        <label className="mb-2 block text-sm font-medium">Phone (E.164)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+15551234567"
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
        />

        <label className="mb-2 block text-sm font-medium">SMS Code</label>
        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 tracking-widest text-center focus:ring-2 focus:ring-brand-500"
        />

        {err ? (
          <p className="mb-3 text-sm text-red-600">{err}</p>
        ) : msg ? (
          <p className="mb-3 text-sm text-emerald-600">{msg}</p>
        ) : null}

        <button
          type="submit"
          disabled={!canVerify || loading}
          className="btn primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>
      </form>
    </main>
  );
}