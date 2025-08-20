// app/auth/callback/page.jsx
"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    const redirect = params.get("redirect") || "/";

    if (!code) {
      router.replace(redirect);
      return;
    }

    (async () => {
      // PKCE exchange on the client
      const { error } = await supabase.auth.exchangeCodeForSession({ code });
      if (error) console.error("[auth/callback] exchange error:", error);
      router.replace(redirect);
    })();
  }, [params, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
      Finishing sign-in…
    </div>
  );
}