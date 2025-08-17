import { Suspense } from 'react';
import SuccessClient from './SuccessClient';

// prevent static prerender errors (force runtime)
export const dynamic = 'force-dynamic';

export default function SuccessPage() {
  return (
    <main className="container-page py-12">
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <SuccessClient />
      </Suspense>
    </main>
  );
}