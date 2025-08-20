// lib/supabaseServer.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

/**
 * Server-side Supabase client that persists the session in Next.js cookies.
 */
export function supabaseServer() {
  const store = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return store.get(name)?.value;
        },
        set(name, value, options) {
          try {
            store.set({ name, value, ...options });
          } catch {
            // noop during build
          }
        },
        remove(name, options) {
          try {
            store.set({ name, value: "", ...options });
          } catch {
            // noop during build
          }
        },
      },
    }
  );
}