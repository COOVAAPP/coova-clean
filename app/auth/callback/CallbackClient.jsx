// app/auth/callback/CallbackClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        if (!s?.session) {
          const { error } = await supabase.auth.exchangeCodeForSession();
          if (error) throw error;
        }
        const next = params.get("next") || "/";
        if (!cancelled) router.replace(next);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Sign in failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Signing you in…</h1>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}