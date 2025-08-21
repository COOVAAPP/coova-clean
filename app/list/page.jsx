// app/list/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ListGatePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function go() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data?.session;

      // Not logged in → open modal on home then proceed to /list/create
      if (!session) {
        router.replace(`/?auth=1&next=${encodeURIComponent("/list/create")}`);
        return;
      }

      // Check profile.is_adult
      const uid = session.user.id;
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("is_adult")
        .eq("id", uid)
        .single();

      if (pErr) {
        // if no profile row yet, you might create it elsewhere
        router.replace(`/verify-age?next=${encodeURIComponent("/list/create")}`);
        return;
      }

      if (!profile?.is_adult) {
        router.replace(`/verify-age?next=${encodeURIComponent("/list/create")}`);
        return;
      }

      // all good → go to create
      router.replace("/list/create");
    }

    go();

    // if they log in/out while here
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      if (!s) router.replace(`/?auth=1&next=${encodeURIComponent("/list/create")}`);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold">Loading…</h1>
      <p className="mt-4 text-sm text-gray-500">Checking your account…</p>
    </main>
  );
}