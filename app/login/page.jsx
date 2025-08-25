// app/login/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal.jsx"; // your existing modal
import { createClient } from "@supabase/supabase-js";

const supabase =
  typeof window !== "undefined"
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(true);

  const nextPath = useMemo(
    () => decodeURIComponent(sp.get("next") || "/"),
    [sp]
  );

  // If already signed in, bounce immediately
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        router.replace(nextPath);
      }
    })();
  }, [router, nextPath]);

  // When auth state changes to signed in, go to ?next
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) router.replace(nextPath);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, [router, nextPath]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        defaultTab="signin"
        // ensure Apple is NOT listed unless you’ve configured it
        providers={["google", "github", "email"]}
        // if your AuthModal exposes a callback on success, you can also:
        // onSuccess={() => router.replace(nextPath)}
      />
    </main>
  );
}