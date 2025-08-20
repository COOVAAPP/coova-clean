// app/profile/page.jsx
"use client";

// Do NOT pre-render or cache this page
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login?redirect=/profile");
        return;
      }

      setUser(session.user);

      // Optional: load extended profile from a `profiles` table
      // Adjust column & table names to your schema
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[profile] load profile error:", error);
      }

      if (mounted) {
        setProfile(data || null);
        setLoading(false);
      }
    })();

    // React to auth changes
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace("/login?redirect=/profile");
    });

    return () => {
      mounted = false;
      sub.data?.subscription?.unsubscribe?.();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="container-page py-10">
        <h1 className="text-xl font-bold mb-3">Profile</h1>
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-3">
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{user?.email}</div>
        </div>

        {profile && (
          <>
            <div className="mb-3">
              <div className="text-sm text-gray-500">Display Name</div>
              <div className="font-medium">{profile.display_name || "—"}</div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-500">Phone</div>
              <div className="font-medium">{profile.phone || "—"}</div>
            </div>
          </>
        )}

        <button
          onClick={signOut}
          className="mt-6 rounded-full bg-black px-5 py-2 text-white hover:bg-gray-800"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}