"use client";

import { createBrowserClient } from "@supabase/ssr";

// Your Supabase project (exact values you gave me)
const SUPABASE_URL = "https://opnqqloemtaaowfttafs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbnFxbG9lbXRhYW93ZnR0YWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Mjg4MjAsImV4cCI6MjA3MDIwNDgyMH0._JApGaHuUvihMx5Yfdgdf5kd8O3SmGMNa6er5duRzD4";

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);