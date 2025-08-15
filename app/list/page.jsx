"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabaseClient";
import UploadBox from "./UploadBox.jsx";

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const redirect = "/list";
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      if (!done) setReady(true);
    };

    check();
    const sub = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });

    return () => {
      done = true;
      sub?.data?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>List Your Space</h1>
      <UploadBox />
    </main>
  );
}