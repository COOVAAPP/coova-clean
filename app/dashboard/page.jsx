"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.replace("/login");
      } else {
        setSession(data.session);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Dashboard</h1>

      {/* Example cards – replace with your real stats */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Listings</p>
          <p className="mt-2 text-3xl font-extrabold">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Bookings</p>
          <p className="mt-2 text-3xl font-extrabold">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Earnings</p>
          <p className="mt-2 text-3xl font-extrabold">$0</p>
        </div>
      </div>
    </main>
  );
}