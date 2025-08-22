// app/list/create/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CreateListingClient from "@/components/CreateListingClient";

export default function CreateListingPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        // open login modal on this page and come back here after login
        const url = new URL(window.location.href);
        url.searchParams.set("auth", "1");
        url.searchParams.set("next", "/list/create");
        router.replace(url.pathname + "?" + url.searchParams.toString());
      } else {
        setReady(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (session) {
        setReady(true);
        // clean up ?auth parameter
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        router.replace(url.pathname + "?" + url.searchParams.toString());
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, search]);

  if (!ready) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold">Create Listing</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">
        Create Listing
      </h1>
      <div className="mt-8">
        <CreateListingClient />
      </div>
    </main>
  );
}