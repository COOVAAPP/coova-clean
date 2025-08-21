"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const AVATAR_BUCKET = "avatars";
const SIGNED_URL_EXPIRES = 60 * 60; // 1 hour

export default function Header({ session }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");

  // Fetch avatar signed URL
  const refreshAvatar = async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", userId)
      .single();

    if (error || !data?.avatar_path) {
      setAvatarUrl("");
      return;
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(data.avatar_path, SIGNED_URL_EXPIRES);

    if (!signErr && signed?.signedUrl) {
      setAvatarUrl(signed.signedUrl);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) {
      refreshAvatar(session.user.id);
    }
  }, [session]);

  // Subscribe to profile updates (realtime)
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel("profile-avatar")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        async (payload) => {
          const newPath = payload.new?.avatar_path;
          if (newPath) {
            const { data: signed, error: signErr } = await supabase.storage
              .from(AVATAR_BUCKET)
              .createSignedUrl(newPath, SIGNED_URL_EXPIRES);
            if (!signErr && signed?.signedUrl) {
              setAvatarUrl(signed.signedUrl);
            }
          } else {
            setAvatarUrl("");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Handle logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <Link href="/" className="text-4xl font-bold text-cyan-500 hover:text-black">
        COOVA
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/browse" className="hover:text-cyan-500">
          Browse
        </Link>
        <Link href="/list" className="hover:text-cyan-500">
          List your space
        </Link>

        {session ? (
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-cyan-500"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500 text-white font-bold cursor-pointer">
                {session.user.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <div className="absolute right-0 mt-2 hidden group-hover:block bg-white shadow-lg rounded-md">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-cyan-50"
              >
                Profile
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-2 hover:bg-cyan-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 hover:bg-cyan-50"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-black"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}