"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const signInWithGoogle = async () => {
    const origin = window.location.origin;
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "/list";

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`,
      },
    });
  };

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px" }}>
      <h1>Login</h1>
      <button className="btn primary" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </main>
  );
}