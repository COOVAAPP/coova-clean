"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function ListGate() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // open modal via query flag
        router.replace("/?auth=1");
      } else {
        // continue to your actual create/edit flow
        router.replace("/list/new"); // or wherever your form lives
      }
    })();
  }, [router]);

  return <main className="container-page py-10">Loading…</main>;
}