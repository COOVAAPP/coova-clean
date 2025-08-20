"use client";

/**
 * AuthCallbackPage
 * Handles Supabase PKCE exchange on the client and redirects home.
 * - No SSR/ISR. No pre-render. No cache.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import supabase from "@/lib/supabaseClient";



/** The inner component must be wrapped in <Suspense> because it uses useSearchParams */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");

    // No code? Go home.
    if (!code) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        // Supabase JS v2 PKCE exchange
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (error) {
          console.error("[/auth/callback] exchange error:", error);
        }
      } catch (err) {
        console.error("[/auth/callback] unexpected error:", err);
      } finally {
        // Always clean up the URL and land on home
        router.replace("/");
      }
    })();
    // we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // nothing to render, we immediately redirect
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] grid place-items-center text-gray-600">
          Finishing sign-in…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}