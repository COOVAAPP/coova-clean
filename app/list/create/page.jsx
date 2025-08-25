// app/list/create/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateListingClient from "@/components/CreateListingClient.jsx";
import { createClient } from "@supabase/supabase-js";

// Make sure env vars exist before creating the client
const supabase =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export default function CreateListingPage() {
  const router = useRouter();
  // ❌ no TS generics in .jsx
  const [status, setStatus] = useState("checking"); // "checking" | "authed" | "guest"

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!supabase) {
        // If the client isn't ready, consider this a guest and push to login
        setStatus("guest");
        const next = encodeURIComponent("/list/create");
        router.replace(`/login?next=${next}`);
        return;
      }

      // Fast local session read
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user ?? null;

      if (!mounted) return;

      if (!user) {
        setStatus("guest");
        const next = encodeURIComponent("/list/create");
        router.replace(`/login?next=${next}`);
      } else {
        setStatus("authed");
      }
    })();

    // If auth changes while this page is open, advance
    const sub = supabase?.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) {
        setStatus("authed");
        router.replace("/list/create");
      }
    });

    return () => {
      mounted = false;
      // guard in case sub is undefined
      try {
        sub?.data?.subscription?.unsubscribe?.();
        sub?.subscription?.unsubscribe?.(); // older supabase-js
      } catch {}
    };
  }, [router]);

  if (status !== "authed") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking your session…</p>
      </main>
    );
  }

  // ✅ Authenticated: render your flow
  return <CreateListingClient />;
}