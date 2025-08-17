import { supabase } from "@/lib/supabaseClient";

export async function uploadToBucket(bucket, file, path) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function insertAsset({ listing_id, owner_id, type, url, mime, duration_s = null, position = 0 }) {
  const { data, error } = await supabase
    .from("listing_assets")
    .insert([{ listing_id, owner_id, type, url, mime, duration_s, position }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAsset(asset) {
  const bucket = asset.type === "video" ? "listing-videos" : "listing-images";
  // derive object key from public URL
  const url = new URL(asset.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/public\/[^/]+\//, ""));
  await supabase.storage.from(bucket).remove([key]);
  await supabase.from("listing_assets").delete().eq("id", asset.id);
}