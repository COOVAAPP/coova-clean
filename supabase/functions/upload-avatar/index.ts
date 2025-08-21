import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BUCKET = "avatars";
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

serve(async (req) => {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(token);
    if (userErr || !user) return new Response("Unauthorized", { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new Response("No file provided", { status: 400 });
    if (file.size > MAX_SIZE) return new Response("File exceeds 50MB limit", { status: 400 });

    const safeName = file.name.replace(/\s+/g, "-");
    const path = `${user.id}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (upErr) return new Response(upErr.message, { status: 500 });

    return new Response(JSON.stringify({ path }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
});