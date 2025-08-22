// app/page.jsx  (Server Component)
// NOTE: Do NOT add "use client" here.
// We keep the page as a server component and render the client UI inside Suspense.

import { Suspense } from "react";
import HomeClient from "./HomeClient"; // client-side homepage content

// Disable caching if you want always-fresh SSR (safe for now)
// If you later want ISR, remove these exports and use a number like revalidate = 60.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-4 py-10">
            <p className="text-gray-600">Loading…</p>
          </div>
        }
      >
        <HomeClient />
      </Suspense>
    </main>
  );
}