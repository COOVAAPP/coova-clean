"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.replace("/");
      return;
    }

    // Complete the PKCE OAuth flow
    supabase.auth.exchangeCodeForSession(code).then(() => {
      router.replace("/"); // or '/dashboard'
    });
  }, [params, router]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500">Signing you in…</h1>
    </main>
  );
}