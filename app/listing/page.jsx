// app/listing/page.jsx
// SERVER component (no "use client")

import { Suspense } from "react";
import ListingBrowseClient from "./ListingBrowseClient";

export const dynamic = "force-dynamic";   // don't prerender; page is URL-state-driven

export default function ListingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Browse</h1>
      <Suspense fallback={<p className="mt-4 text-gray-600">Loading listings…</p>}>
        <ListingBrowseClient />
      </Suspense>
    </main>
  );
}