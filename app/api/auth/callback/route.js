export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect") || "/";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }
  return Response.redirect(new URL(redirect, request.url));
}