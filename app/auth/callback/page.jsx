// app/auth/callback/page.jsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        // Handles OAuth and email magic link redirects
        await supabase.auth.exchangeCodeForSession();
      } catch (e) {
        console.error("exchangeCodeForSession error:", e);
      } finally {
        // Go back to where users likely came from
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/";
        window.location.replace(next);
      }
    })();
  }, []);

  return (
    <main className="min-h-[50vh] grid place-items-center">
      <p className="text-gray-600">Signing you in…</p>
    </main>
  );
}