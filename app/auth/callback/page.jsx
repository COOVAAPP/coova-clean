'use client';

/** Make this route always run on the client and never be cached */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';

/** The inner component that uses useSearchParams must be wrapped in Suspense */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');

    // If we don't have a code, just go home
    if (!code) {
      router.replace('/');
      return;
    }

    (async () => {
      // Exchange the PKCE code for a session
      // supabase-js v2 signature:
      const { error } = await supabase.auth.exchangeCodeForSession({ code });

      // If anything goes wrong, we still send the user to the homepage
      if (error) {
        console.error('[auth/callback] exchange error:', error);
      }

      // Replace, so the callback URL doesn't stay in history
      router.replace('/');
    })();
  }, [params, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-700">
      Finishing sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}