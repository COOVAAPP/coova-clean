// app/verify-age/VerifyAgeClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyAgeClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState(null);

  // where to go after success
  const next = params?.get("next") || "/";

  // load session on mount (client-side only)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const uid = data?.session?.user?.id ?? null;
      setUserId(uid);
      setSessionReady(true);
    })();

    // react on auth changes (e.g., user signed in from modal)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function onConfirm() {
    setErr("");

    if (!checked) {
      setErr("You must confirm you are 18+ to continue.");
      return;
    }

    setSaving(true);
    try {
      // if not logged in, send them to login with a return trip back here
      if (!userId) {
        const returnTo = `/verify-age?next=${encodeURIComponent(next)}`;
        router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
        return;
      }

      // mark profile as adult
      const { error } = await supabase
        .from("profiles")
        .update({ is_adult: true, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      // done — go to intended page
      router.push(next);
    } catch (e) {
      console.error(e);
      setErr("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
        Age verification
      </h1>
      <p className="mt-4 text-gray-600">
        You must be 18 years or older to create a listing or book a space.
      </p>

      {/* status about login */}
      {sessionReady && !userId && (
        <div className="mt-4 text-sm text-gray-600">
          You’re not signed in. You can still confirm, and we’ll first take you
          to sign in, then return you here automatically.
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4">
        <input
          id="adult"
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <label htmlFor="adult" className="text-sm text-gray-800">
          I confirm that I am 18 years of age or older.
        </label>
      </div>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

      <div className="mt-6">
        <button
          onClick={onConfirm}
          disabled={saving}
          className="rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}