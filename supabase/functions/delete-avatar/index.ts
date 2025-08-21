import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BUCKET = "avatars";

serve(async (req) => {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) return new Response("Unauthorized", { status: 401 });

    const { path } = await req.json();
    if (!path || typeof path !== "string") return new Response("Missing path", { status: 400 });
    if (!path.startsWith(`${user.id}/`)) return new Response("Forbidden", { status: 403 });

    const { error: delErr } = await supabase.storage.from(BUCKET).remove([path]);
    if (delErr) return new Response(delErr.message, { status: 500 });

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_path: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (dbErr) return new Response(dbErr.message, { status: 500 });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
});