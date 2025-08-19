"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function VerifySmsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const phoneFromQuery = params.get("phone") || "";
  const redirect = params.get("redirect") || "/";

  const [phone, setPhone] = useState(phoneFromQuery);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => { setPhone(phoneFromQuery); }, [phoneFromQuery]);

  const canVerify = useMemo(() => {
    if (!phone?.trim()) return false;
    if (!code?.trim()) return false;
    return true;
  }, [phone, code]);

  async function verify(e) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!canVerify) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: code.trim(),
        type: "sms",
      });
      if (error) throw error;

      setMsg("Success! Signing you in…");
      // fetch session to be safe, then redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(redirect);
      } else {
        // fallback: go home
        router.replace("/");
      }
    } catch (e) {
      setErr(e?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">Verify your phone</h1>

      {err && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
      {msg && <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

      <form onSubmit={verify} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 1234"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">SMS Code</label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={!canVerify || loading}
          className="w-full rounded-md bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>

        <p className="pt-2 text-center text-sm text-gray-500">
          Didn’t get a code? Go back and resend from the <a href="/login" className="text-brand-500 hover:text-brand-600">login</a> screen.
        </p>
      </form>
    </main>
  );
}