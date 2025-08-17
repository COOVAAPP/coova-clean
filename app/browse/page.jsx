// app/browse/page.jsx
import { Suspense } from 'react';
import BrowseClient from './BrowseClient';

// Prevent static prerender errors for client search params
export const dynamic = 'force-dynamic';

export default function BrowsePage() {
  return (
    <main className="container-page py-10">
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <BrowseClient />
      </Suspense>
    </main>
  );
}