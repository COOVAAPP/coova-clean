// components/AgeGateSync.jsx
"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AgeGateSync() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const syncIfNeeded = async () => {
      // If user hasn't confirmed locally, do nothing.
      if (typeof window === "undefined") return;
      const ok = localStorage.getItem("age_gate_ok");
      if (!ok) return;

      // See if a user is signed in
      const { data: { user } = {}, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user?.id) return;

      // Optional: read profile first to skip unnecessary updates
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, age_verified")
        .eq("id", user.id)
        .single();

      if (prof && prof.age_verified === true) return;

      // Mark verified in DB (allowed by your "update own profile" RLS)
      await supabase.from("profiles").update({ age_verified: true }).eq("id", user.id);
    };

    // Run once on mount
    syncIfNeeded();

    // Also run whenever auth state changes (e.g., they just signed in)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, _session) => {
      syncIfNeeded();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return null;
}