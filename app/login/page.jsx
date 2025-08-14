"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "../../lib/supabaseClient";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/list";

  useEffect(() => {
    // keeps the component client-only and stable
  }, [redirect]);

  const signInWithGoogle = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`
      }
    });
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>Login</h1>
      <button className="btn primary" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </main>
  );
}