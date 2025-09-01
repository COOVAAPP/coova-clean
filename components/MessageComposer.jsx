"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { supabase } from "@/lib/supabaseClient";

export default function MessageComposer({ conversationId, onSent }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function uploadAttachment() {
    if (!file) return null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not signed in");

    const path = `${conversationId}/${userId}/${uuid()}-${file.name}`;
    const { data, error } = await supabase
      .storage
      .from("message-attachments")
      .upload(path, file, { upsert: false });

    if (error) throw error;

    // Public bucket or signed URL? If private, you can store the path and serve via edge function.
    // Assuming public bucket for now:
    const { data: url } = supabase.storage.from("message-attachments").getPublicUrl(data.path);
    return url?.publicUrl || null;
  }

  async function send() {
    setError("");
    if (!text.trim() && !file) return;

    try {
      setSending(true);
      const attachmentUrl = await uploadAttachment();

      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          body: text.trim() || "",
          attachmentUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");

      setText("");
      setFile(null);
      onSent?.(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t bg-white p-3">
      {error && (
        <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <label className="cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
          Attach
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <button
          onClick={send}
          disabled={sending}
          className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      {file && (
        <p className="mt-1 text-xs text-gray-500">
          Attachment: <span className="font-medium">{file.name}</span>
        </p>
      )}
    </div>
  );
}