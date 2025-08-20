// app/profile/page.jsx
"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data?.session) {
        router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
        return;
      }

      setSession(data.session);
      setLoading(false);
    })();

    const sub = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!sess) {
        router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
      } else {
        setSession(sess);
      }
    });

    return () => {
      mounted = false;
      sub?.data?.subscription?.unsubscribe?.();
    };
  }, [router]);

  async function onSignOut() {
    await supabase.auth.signOut();
    router.replace("/"); // go home after sign-out
  }

  if (loading) {
    return (
      <main className="container-page py-10">
        <p>Loading your profile…</p>
      </main>
    );
  }

  const user = session?.user;

  return (
    <main className="container-page py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="rounded-lg border p-4">
        <div className="mb-2">
          <span className="font-medium">User ID:</span>{" "}
          <span className="text-gray-700">{user?.id}</span>
        </div>

        <div className="mb-2">
          <span className="font-medium">Email:</span>{" "}
          <span className="text-gray-700">{user?.email ?? "—"}</span>
        </div>

        <div className="mb-2">
          <span className="font-medium">Phone:</span>{" "}
          <span className="text-gray-700">{user?.phone ?? "—"}</span>
        </div>

        <button
          onClick={onSignOut}
          className="mt-4 inline-flex items-center rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
   