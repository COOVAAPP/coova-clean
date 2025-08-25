// app/list/create/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateListingClient from "@/components/CreateListingClient.jsx"; // keep your existing component
import { createClient } from "@supabase/supabase-js";

// browser client
const supabase =
  typeof window !== "undefined"
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export default function CreateListingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed" | "guest">("checking");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!supabase) return;

      // get session (fast, local)
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user ?? null;

      if (!mounted) return;

      if (!user) {
        setStatus("guest");
        // send them to login with a return path
        const next = encodeURIComponent("/list/create");
        router.replace(`/login?next=${next}`);
      } else {
        setStatus("authed");
      }
    })();

    // if they log in on this tab (rare), move forward
    const { data: sub } = supabase?.auth.onAuthStateChange((evt, session) => {
      if (session?.user) {
        setStatus("authed");
        router.replace("/list/create");
      }
    }) ?? { data: null };

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (status !== "authed") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking your session…</p>
      </main>
    );
  }

  // ✅ user is authenticated – render your existing flow
  return <CreateListingClient />;
}