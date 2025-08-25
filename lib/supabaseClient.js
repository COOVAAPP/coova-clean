// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/**
 * Create a single Supabase client instance for the browser.
 * Avoids the “Multiple GoTrueClient instances detected” warning.
 */
let _client;

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    _client = createClient(url, key);
  }
  return _client;
}

export const supabase = getSupabase();