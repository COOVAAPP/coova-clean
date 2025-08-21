"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic"; // do checks at runtime

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Session + 18+ check
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("verified_18")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (error || !prof?.verified_18) {
        router.replace("/verify-age");
        return;
      }

      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">List your space</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">
        List your space
      </h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          Your listing form goes here. (This page compiles without any external components.)
        </p>
      </div>
    </main>
  );
}