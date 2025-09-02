"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageComposer from "@/components/MessageComposer";

export default function ThreadPage({ params }) {
  const { conversationId } = params;
  const [items, setItems] = useState([]);
  const lastCountRef = useRef(0);

  async function load() {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`, { cache: "no-store" });
    const json = await res.json();
    setItems(json.items || []);
  }

  // ---- NEW: mark as read
  async function markRead() {
    if (!conversationId) return;
    try {
      await fetch(`/api/inbox/${conversationId}/read`, { method: "POST" });
    } catch (e) {
      // non-fatal
      console.warn("markRead failed", e);
    }
  }

  useEffect(() => {
    load().then(() => markRead());
  }, [conversationId]);

  // Realtime
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`msgs-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new;
          setItems((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new;
          setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const deletedId = payload.old.id;
          setItems((prev) => prev.filter((x) => x.id !== deletedId));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  // ---- NEW: whenever list grows, mark as read
  useEffect(() => {
    if (items.length && items.length !== lastCountRef.current) {
      lastCountRef.current = items.length;
      markRead();
    }
  }, [items]);

  // ---- NEW: mark as read on focus
  useEffect(() => {
    const onFocus = () => markRead();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [conversationId]);

  return (
    <main className="container-page py-8">
      <h1 className="mb-4 text-xl font-bold">Conversation</h1>

      <div className="rounded border bg-white">
        <div className="max-h-[60vh] overflow-auto p-3 space-y-3">
          {items.map((m) => (
            <div key={m.id} className="rounded border p-2">
              <div className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
              {m.body && <div className="mt-1 text-sm">{m.body}</div>}
              {m.attachment_url && (
                <a href={m.attachment_url} target="_blank" className="mt-1 inline-block text-sm text-cyan-600 underline">
                  Attachment
                </a>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
        </div>

        <MessageComposer
          conversationId={conversationId}
          onSent={() => {
            load(); // you can rely on realtime, this just guarantees immediate echo
          }}
        />
      </div>
    </main>
  );
}