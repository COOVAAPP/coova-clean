// app/auth/callback/page.jsx
"use client";

export const dynamic = "force-dynamic";   // never pre-render
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

/**
 * We wrap the hook user in Suspense to satisfy Next 15
 * when using useSearchParams in a client page.
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      router.replace("/");
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[auth/callback] exchange error:", error);
      }
      router.replace("/"); // always land back on home
    })();
  }, [params, router]);

  return (
    <div className="min-h-[60vh] grid place-items-center text-gray-600">
      Finishing sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] grid place-items-center">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}