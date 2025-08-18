import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Where we should return after setting the session
  const redirect = searchParams.get("redirect") || "/";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    // Exchange the code for a session & set cookies server-side
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect back to the intended page (absolute URL required)
  const url = redirect.startsWith("http")
    ? redirect
    : `${origin}${redirect}`;
  return NextResponse.redirect(url);
}