// /app/list/create/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function CreateListingPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/login?redirect=/list/create");
      }
    })();
  }, [router]);

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold">Create a Listing</h1>
      <p className="mt-2 text-gray-600">Form coming soon…</p>
    </main>
  );
}