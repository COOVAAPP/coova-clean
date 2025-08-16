"use client";

import { useCallback } from "react";
import supabase from "@/lib/supabaseClient";

export default function LoginClient({ redirect }) {
  const signInWithGoogle = useCallback(async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`,
      },
    });
  }, [redirect]);

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <button className="btn primary" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </main>
  );
}