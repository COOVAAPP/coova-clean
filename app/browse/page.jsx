// app/browse/page.jsx
import { Suspense } from "react";
import BrowseClient from "./BrowseClient";

export const dynamic = "force-dynamic";

export default function BrowsePage() {
  return (
    <main className="container-page py-10">
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <BrowseClient />
      </Suspense>
    </main>
  );
}