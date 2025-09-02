// lib/uploadMessageAttachment.js
import { supabase } from "@/lib/supabaseClient";

/**
 * Upload a File to message-attachments bucket under conv/user folders.
 * Returns a public URL (or signed URL if your bucket isn't public).
 */
export async function uploadMessageAttachment(file, conversationId, userId) {
  const ext = file.name.split(".").pop() || "bin";
  const key = `${conversationId}/${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("message-attachments")
    .upload(key, file, { upsert: false });

  if (error) throw error;

  // If the bucket is public, you can build the public URL:
  const publicUrl = supabase.storage.from("message-attachments").getPublicUrl(data.path).data
    .publicUrl;

  return publicUrl;
}