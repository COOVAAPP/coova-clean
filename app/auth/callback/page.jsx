// app/auth/callback/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // let Supabase parse the code from URL and update session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error.message);
      }

      // check for stored returnTo (set in AuthModal before login)
      let returnTo = "/";
      try {
        const stored = window.localStorage.getItem("returnTo");
        if (stored) {
          returnTo = stored;
          window.localStorage.removeItem("returnTo");
        }
      } catch {}

      router.replace(returnTo);
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Finishing sign-in, please wait…</p>
    </div>
  );
}