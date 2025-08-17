'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold">Payment Successful</h1>
      {sessionId ? (
        <p className="text-gray-600">
          Stripe Session: <code className="break-all">{sessionId}</code>
        </p>
      ) : (
        <p className="text-gray-600">Thank you for placing your reservation. Plese check your email for your confirmation details.</p>
      )}

      <div className="pt-4">
        <Link href="/list" className="btn primary">Back to Listings</Link>
      </div>
    </div>
  );
}