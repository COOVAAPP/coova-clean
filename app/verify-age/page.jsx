// app/verify-age/page.jsx
export const dynamic = "force-dynamic";     // don't cache
export const fetchCache = "force-no-store";  // disable fetch cache

import { Suspense } from "react";
import VerifyAgeClient from "./VerifyAgeClient";

export default function VerifyAgePage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-4 py-10">
            <p className="text-gray-600">Loading…</p>
          </div>
        }
      >
        <VerifyAgeClient />
      </Suspense>
    </main>
  );
}