"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = "force-dynamic"; // ⬅️ prevents prerender error

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Auth callback error:", error.message);
        }
        router.replace("/dashboard"); // go somewhere safe after login
      });
    } else {
      router.replace("/login");
    }
  }, [params, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-gray-600">Finishing sign in…</p>
    </main>
  );
}