import { createClient } from "@supabase/supabase-js";

// Use NEXT_PUBLIC_* env vars so they are available in the client/browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure env vars exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check your .env.local file.");
}

// Export a singleton client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);