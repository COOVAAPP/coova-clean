"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Get current session from the browser
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If NOT logged in, go to login with redirect back to /list
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }

      // Logged in -> show the page
      if (!cancelled) setReady(true);
    }

    // Listen for auth changes (just in case the session arrives slightly later)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setReady(true);
        } else {
          router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        }
      }
    );

    check();

    return () => {
      cancelled = true;
      authListener.subscription?.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  // === Your authenticated content ===
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>List Your Space</h1>
      <p>Authenticated. Render your form here.</p>
    </main>
  );
}