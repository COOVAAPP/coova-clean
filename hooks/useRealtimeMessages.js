// hooks/useRealtimeMessages.js
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Realtime subscription to messages in a conversation.
 * Calls `onInsert(newRow)` whenever a new message appears.
 */
export default function useRealtimeMessages(conversationId, { onInsert } = {}) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onInsert?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onInsert]);
}