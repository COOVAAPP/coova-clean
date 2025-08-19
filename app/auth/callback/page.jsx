"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Completing sign-in…");

  useEffect(() => {
    (async () => {
      try {
        const code = searchParams.get("code");
        const redirect = searchParams.get("redirect") || "/";

        if (!code) {
          setMsg("Missing authorization code. Returning to login…");
          setTimeout(() => (window.location.href = "/login"), 900);
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMsg("Sign-in failed. Redirecting to login…");
          setTimeout(() => (window.location.href = "/login"), 900);
          return;
        }

        // success: go to homepage (or provided redirect)
        window.location.replace(redirect);
      } catch {
        setMsg("Unexpected error. Redirecting to login…");
        setTimeout(() => (window.location.href = "/login"), 900);
      }
    })();
  }, [searchParams]);

  return (
    <main className="container-page py-10">
      <p>{msg}</p>
    </main>
  );
}