// app/browse/page.jsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import BrowseClient from "./BrowseClient";

export default function BrowsePage() {
  return (
    <main className="container-page py-10">
      <h1 className="mb-4 text-2xl font-extrabold text-cyan-500">Browse</h1>
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <BrowseClient />
      </Suspense>
    </main>
  );
}