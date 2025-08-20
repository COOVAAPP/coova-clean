// /app/auth/callback/CallbackClient.jsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.replace("/");
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession({ code });
      if (error) {
        console.error("Auth exchange error:", error);
      }
      router.replace("/");
    })();
  }, [params, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-700">
      Finishing sign-in…
    </div>
  );
}