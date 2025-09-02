// components/MessageThread.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchMessages,
  sendMessage,
  markThreadRead,
} from "@/lib/inboxClient";
import useRealtimeMessages from "@/hooks/useRealtimeMessages";
import { uploadMessageAttachment } from "@/lib/uploadMessageAttachment";

export default function MessageThread({ conversationId }) {
  const [items, setItems] = useState([]);         // newest first in state
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { items, nextCursor } = await fetchMessages(conversationId, { limit: 50 });
        setItems(items);
        setNextCursor(nextCursor);
        await markThreadRead(conversationId);
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);

  // realtime
  useRealtimeMessages(conversationId, {
    onInsert: async (row) => {
      setItems((prev) => [row, ...prev]);
      await markThreadRead(conversationId);
    },
  });

  async function onLoadOlder() {
    if (!nextCursor) return;
    const { items: older, nextCursor: next } = await fetchMessages(conversationId, {
      limit: 50,
      cursor: nextCursor,
    });
    setItems((prev) => [...prev, ...older]);
    setNextCursor(next);
  }

  async function onSend(e) {
    e.preventDefault();
    if (sending) return;

    const text = inputRef.current?.value.trim();
    const file = e.target.elements.file?.files?.[0];
    if (!text && !file) return;

    setSending(true);
    try {
      let attachment_url = null;
      if (file) {
        const { data: { user } } = await supabase.auth.getUser();
        attachment_url = await uploadMessageAttachment(file, conversationId, user?.id);
        e.target.reset(); // clear file input
      }

      const item = await sendMessage(conversationId, { content: text || "", attachment_url });
      setItems((prev) => [item, ...prev]);
      inputRef.current.value = "";
      await markThreadRead(conversationId);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div className="flex-1 overflow-auto border rounded-md bg-white">
        {loading ? (
          <p className="p-4 text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-gray-500">Say hi 👋</p>
        ) : (
          <ul className="flex flex-col-reverse p-4 space-y-3 space-y-reverse">
            {items.map((m) => (
              <li key={m.id} className="rounded border p-3">
                {m.content ? <p className="whitespace-pre-wrap">{m.content}</p> : null}
                {m.attachment_url && (
                  <a
                    href={m.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-cyan-700 hover:underline"
                  >
                    Attachment
                  </a>
                )}
                <p className="mt-1 text-[11px] text-gray-500">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* older */}
      {nextCursor && (
        <button
          onClick={onLoadOlder}
          className="mt-3 self-center rounded-full border px-4 py-1 text-sm hover:bg-gray-50"
        >
          Load older
        </button>
      )}

      {/* composer */}
      <form onSubmit={onSend} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          className="flex-1 rounded-md border px-3 py-2"
          placeholder="Type a message…"
        />
        <input type="file" name="file" className="text-sm" />
        <button
          disabled={sending}
          className="rounded-md bg-cyan-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}