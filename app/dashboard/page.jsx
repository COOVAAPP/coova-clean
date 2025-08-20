// app/dashboard/page.jsx
"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data?.session) {
        // Not logged in -> send to login with redirect back to /dashboard
        router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
        return;
      }

      setSession(data.session);
      setLoading(false);
    })();

    const sub = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!sess) {
        router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
      } else {
        setSession(sess);
      }
    });

    return () => {
      mounted = false;
      sub?.data?.subscription?.unsubscribe?.();
    };
  }, [router]);

  if (loading) {
    return (
      <main className="container-page py-10">
        <p>Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome{session?.user?.email ? `, ${session.user.email}` : ""}!
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Your Listings</h2>
          <p className="text-sm text-gray-500">Coming soon…</p>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Bookings</h2>
          <p className="text-sm text-gray-500">Coming soon…</p>
        </section>
      </div>
    </main>
  );
}