"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient.js";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/list";

  useEffect(() => { /* no-op for now */ }, []);

  async function signInWithGoogle() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` }
    });
  }

  return (
    <main className="shell" style={{padding:"60px 0"}}>
      <div className="card" style={{maxWidth:460, padding:22}}>
        <h1 className="page-title" style={{marginTop:0}}>Login</h1>
        <button className="btn primary" onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    </main>
  );
}