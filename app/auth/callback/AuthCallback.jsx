"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const qs = useSearchParams();

  const [status, setStatus] = useState("Finishing sign-in…");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) throw error;

        const next = qs.get("next") || "/";
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");

        if (!mounted) return;
        setStatus("Redirecting…");
        router.replace(next);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Could not finish sign-in.");
        setStatus("");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [qs, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-bold text-red-600">Sign-in failed</h1>
        <p className="mt-2 text-sm text-gray-700">{error}</p>
        <button
          className="mt-4 rounded-md border px-3 py-1.5 font-bold hover:bg-gray-50"
          onClick={() => router.replace("/")}
        >
          Go home
        </button>
      </div>
    );
  }

  return <p className="p-6">{status}</p>;
}