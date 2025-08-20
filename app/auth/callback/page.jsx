// app/auth/callback/page.jsx
'use client';

// Run only on the client and never cache this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import supabase from '@/lib/supabaseClient';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');

    // No code? Go home.
    if (!code) {
      router.replace('/');
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession({ code });
      if (error) {
        console.error('[auth/callback] exchange error:', error);
      }
      // Always return to home after the exchange
      router.replace('/');
    })();
  }, [params, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
      Finishing sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
          Finishing sign-in…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}