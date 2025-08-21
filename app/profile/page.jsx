"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session || null);
      if (!data.session) {
        router.replace("/login");
        return;
      }
      // fetch user details
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!mounted) return;
        setUser(user || null);
        setLoading(false);
      });
    });

    // keep session in sync
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

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Profile</h1>

      <div className="mt-6 rounded-lg border border-gray-200 p-6 bg-white">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">User ID</dt>
            <dd className="font-bold break-all">{user?.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="font-bold">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Created</dt>
            <dd className="font-bold">{user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Last Sign In</dt>
            <dd className="font-bold">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}