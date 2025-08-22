// app/list/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ListGatePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data?.session) {
        const qs = new URLSearchParams({ auth: "1", mode: "signup", next: "/list/create" });
        router.replace(`/?${qs.toString()}`);
      } else {
        router.replace("/list/create");
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return (
    <main className="container-page py-10">
      <p className="text-center text-gray-600">Loading…</p>
    </main>
  );
}