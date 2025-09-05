"use client";

import { useEffect, useState } from "react";

async function loadSupabase() {
  try {
    const mod = await import("@/lib/supabaseClient");
    return mod.supabase || mod.default || null;
  } catch {
    return null;
  }
}

export default function AgeSync() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const supabase = await loadSupabase();
      if (!mounted || !supabase) return;

      // Only run if device says verified
      const localVerified = typeof window !== "undefined" && localStorage.getItem("age_verified") === "true";
      if (!localVerified) {
        setReady(true);
        return;
      }

      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) {
        setReady(true);
        return; // not signed in; nothing to sync
      }

      try {
        // Check profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, age_verified")
          .eq("id", uid)
          .single();

        if (!profile?.age_verified) {
          await supabase
            .from("profiles")
            .upsert({ id: uid, age_verified: true }, { onConflict: "id" });
        }
      } catch {
        // swallow errors silently; this is a best-effort sync
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return ready ? null : null;
}