"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false;

    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      if (!stop) setReady(true);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });

    check();
    return () => {
      stop = true;
      sub.subscription?.unsubscribe();
    };
  }, [router]);

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>List Your Space</h1>
      <p>You're signed in. Put the listing form here.</p>
    </main>
  );
}