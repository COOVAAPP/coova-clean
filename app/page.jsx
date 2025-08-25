// app/page.jsx
export const dynamic = "force-static";   // never render on the server at runtime
export const revalidate = false;         // no ISR either

import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-gray-600">Loading…</p>
        </div>
      }>
        <HomeClient />
      </Suspense>
    </main>
  );
}