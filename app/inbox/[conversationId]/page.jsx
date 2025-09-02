"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageComposer from "@/components/MessageComposer";

export default function ThreadPage({ params }) {
  const { conversationId } = params;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null); // { id, email, ... }
  const scrollerRef = useRef(null);

  // --- helpers --------------------------------------------------------------

  const scrollToBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const markAsRead = useCallback(async () => {
    try {
      if (!me?.id || !conversationId) return;

      // Update the participant record for *this* user in this conversation.
      // Assumes a table `conversation_participants (conversation_id uuid, user_id uuid, last_read_at timestamptz)`
      const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", me.id);

      if (error) {
        // Not fatal for the UI; just log for debugging.
        console.warn("markAsRead failed:", error);
      }
    } catch (e) {
      console.warn("markAsRead exception:", e);
    }
  }, [me?.id, conversationId]);

  // --- initial session & messages load -------------------------------------

  useEffect(() => {
    let mounted = true;

    (async () => {
      // get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted) return;
      setMe(userData?.user || null);

      // load messages
      setLoading(true);
      try {
        const res = await fetch(
          `/api/messages?conversationId=${encodeURIComponent(conversationId)}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!mounted) return;
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e) {
        if (!mounted) return;
        console.error(e);
      } finally {
        if (!mounted) return;
        setLoading(false);
        // after first load, try to mark as read
        markAsRead();
        // and scroll to bottom
        setTimeout(scrollToBottom, 0);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [conversationId, markAsRead, scrollToBottom]);

  // --- realtime subscription ------------------------------------------------

  useEffect(() => {
    if (!conversationId) return;

    const chan = supabase
      .channel(`msgs-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new;
          // append if not present
          setItems((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));

          // If the new message is NOT from me and the tab is focused, mark as read.
          if (m.sender_id && me?.id && m.sender_id !== me.id && document.visibilityState === "visible") {
            markAsRead();
          }

          // keep the view pinned to bottom when new messages arrive
          setTimeout(scrollToBottom, 0);
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
          const deletedId = payload.old?.id;
          setItems((prev) => prev.filter((x) => x.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chan);
    };
  }, [conversationId, me?.id, markAsRead, scrollToBottom]);

  // --- mark read when user focuses tab or after manual refresh --------------

  useEffect(() => {
    const onFocus = () => {
      // When the tab regains focus, consider everything in view "read"
      markAsRead();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [markAsRead]);

  // --- UI -------------------------------------------------------------------

  return (
    <main className="container-page py-8">
      <h1 className="mb-4 text-xl font-bold">Conversation</h1>

      <div className="rounded border bg-white">
        <div
          ref={scrollerRef}
          className="max-h-[60vh] overflow-auto p-3 space-y-3"
        >
          {loading && <p className="text-gray-500 text-sm">Loading…</p>}

          {!loading && items.length === 0 && (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          )}

          {items.map((m) => (
            <div
              key={m.id}
              className={`rounded border p-2 ${
                m.sender_id && me?.id && m.sender_id === me.id
                  ? "bg-cyan-50 border-cyan-100"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  {new Date(m.created_at).toLocaleString()}
                </div>
                {/* You could show "You" vs other name if you load profiles */}
                {m.sender_id && me?.id && m.sender_id === me.id && (
                  <span className="text-[10px] font-semibold text-cyan-700">You</span>
                )}
              </div>

              {m.body && <div className="mt-1 text-sm whitespace-pre-wrap">{m.body}</div>}

              {m.attachment_url && (
                <a
                  href={m.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-700 underline"
                >
                  Attachment
                </a>
              )}
            </div>
          ))}
        </div>

        <MessageComposer
          conversationId={conversationId}
          onSent={() => {
            // we rely on realtime to show the message,
            // but do a quick markAsRead (you sent it, so it's read for you)
            markAsRead();
            setTimeout(scrollToBottom, 0);
          }}
        />
      </div>
    </main>
  );
}