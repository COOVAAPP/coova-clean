// lib/supabaseClient.js
"use client";

import { createClient } from "@supabase/supabase-js";

// Make sure these two are set in *Vercel* Project → Settings → Environment Variables
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // This helps you catch misconfigured env vars quickly in dev
  // (In prod, it just won't work without them.)
  console.warn(
    "[supabaseClient] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(url, key);
export default supabase;