// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="container-page py-10">
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container-page py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-700">Please sign in to view your dashboard.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-cyan-600 px-5 py-2 font-semibold text-white hover:bg-cyan-700"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
        Dashboard
      </h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold">Your listings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Create, edit, and publish your spaces.
          </p>
          <Link
            href="/list"
            className="mt-3 inline-block text-cyan-600 hover:underline"
          >
            Manage listings
          </Link>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold">Messages</h2>
          <p className="mt-1 text-sm text-gray-600">
            Check and reply to inquiries.
          </p>
          <Link
            href="/messages"
            className="mt-3 inline-block text-cyan-600 hover:underline"
          >
            Go to inbox
          </Link>
        </section>
      </div>
    </main>
  );
}