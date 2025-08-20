// /app/profile/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/login?redirect=/profile");
        return;
      }
      if (mounted) setUser(data.session.user);
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!user) return <div className="container-page py-10">Loading profile…</div>;

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <div className="mt-4 space-y-2">
        <div>Email: {user.email}</div>
        <button
          onClick={signOut}
          className="mt-4 inline-flex items-center rounded bg-black px-4 py-2 text-white hover:opacity-90"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}