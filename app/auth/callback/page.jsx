// app/auth/callback/page.jsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Server-side auth callback handler.
 * Exchanges the PKCE `code` for a session and then redirects.
 */
export default async function AuthCallbackPage({ searchParams }) {
  const code = searchParams?.code || null;
  const next = searchParams?.next || "/";

  // No code? Go home.
  if (!code) redirect(next);

  const supabase = supabaseServer();

  // Exchange code for session (server-side; cookies are handled by supabaseServer)
  const { error } = await supabase.auth.exchangeCodeForSession({ code });

  // Optional logging; always redirect away from callback
  if (error) {
    console.error("[auth/callback] exchange error:", error);
  }

  redirect(next);
}