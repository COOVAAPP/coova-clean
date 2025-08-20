"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled) {
        setUserEmail(user?.email ?? null);
        setLoading(false);
      }
    }

    const { data: authSub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        setUserEmail(session.user?.email ?? null);
        setLoading(false);
      } else {
        router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
      }
    });

    run();

    return () => {
      cancelled = true;
      authSub.subscription?.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return <main className="container-page py-10"><p>Loading…</p></main>;
  }

  return (
    <main className="container-page py-10 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 bg-white">
          <h2 className="font-semibold mb-2">Welcome</h2>
          <p className="text-sm text-gray-600">Signed in as {userEmail ?? "Unknown"}</p>
        </div>

        <div className="rounded-lg border p-6 bg-white">
          <h2 className="font-semibold mb-2">Your Listings</h2>
          <p className="text-sm text-gray-600">Coming soon…</p>
        </div>
      </div>
    </main>
  );
}