"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
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
        router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
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
    <main className="container-page py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="rounded-lg border p-6 bg-white">
        <p className="mb-2"><span className="font-semibold">Email:</span> {userEmail ?? "Unknown"}</p>
        {/* Add more profile fields here */}
      </div>
    </main>
  );
}