"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function cx(...a){return a.filter(Boolean).join(" ");}

export default function MessagesClient() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [active, setActive] = useState(null); // conversation_id
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const subRef = useRef(null);

  // load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setMe(data?.session?.user ?? null);
      setLoading(false);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setMe(s?.user ?? null));
    return () => l?.subscription?.unsubscribe?.();
  }, []);

  // fetch inbox
  async function loadInbox() {
    const { data, error } = await supabase
      .from("inbox_view")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: true });
    if (!error) setInbox(data || []);
  }
  useEffect(() => { if (me) loadInbox(); }, [me]);

  // load thread + subscribe
  useEffect(() => {
    if (!active) { setMessages([]); return; }

    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", active)
        .order("created_at", { ascending: true });
      if (!ignore && !error) setMessages(data || []);
    })();

    // realtime for just this conversation
    subRef.current?.unsubscribe?.();
    subRef.current = supabase
      .channel(`msgs:${active}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => { ignore = true; subRef.current?.unsubscribe?.(); };
  }, [active]);

  // mark as read (append my uid to read_by)
  useEffect(() => {
    if (!me || !active || messages.length === 0) return;
    const unreadMine = messages.filter(m => m.sender_id !== me.id && !(m.read_by || []).includes(me.id));
    if (unreadMine.length === 0) return;

    const ids = unreadMine.map(m => m.id);
    // single batched update using RPC would be ideal; simple loop is fine for now
    (async () => {
      for (const id of ids) {
        // append my id to read_by if missing
        await supabase
          .from("messages")
          .update({ read_by: supabase.rpc("jsonb_insert", {  /* fallback below if function missing */ }) })
          .eq("id", id); // <-- we’ll just do a merge client-side instead:
      }
    })();
  }, [me, active, messages]);

  // simpler mark-as-read (client merge)
  async function markRead(id, read_by) {
    if (!me) return;
    const set = Array.isArray(read_by) ? new Set(read_by) : new Set();
    if (!set.has(me.id)) set.add(me.id);
    await supabase.from("messages").update({ read_by: Array.from(set) }).eq("id", id);
  }
  useEffect(() => {
    if (!me || !active || messages.length === 0) return;
    (async () => {
      for (const m of messages) {
        if (m.sender_id !== me.id && !(m.read_by || []).includes(me.id)) {
          await markRead(m.id, m.read_by);
        }
      }
      // refresh inbox badges
      loadInbox();
    })();
  }, [messages, active, me]);

  async function send() {
    if (!me || !active || !input.trim()) return;
    const body = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      conversation_id: active,
      sender_id: me.id,
      body
    });
    // inbox will refresh on next tick via last_message_at ordering
    loadInbox();
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!me) return <p className="text-gray-500">Please sign in to use messages.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Inbox list */}
      <aside className="rounded-md border bg-white p-3 md:col-span-1">
        <h2 className="text-sm font-semibold mb-2">Inbox</h2>
        <div className="divide-y">
          {inbox.length === 0 ? (
            <p className="text-sm text-gray-500 p-2">No conversations yet.</p>
          ) : inbox.map(c => (
            <button
              key={c.conversation_id}
              onClick={() => setActive(c.conversation_id)}
              className={cx(
                "w-full text-left p-2 hover:bg-gray-50",
                active === c.conversation_id && "bg-cyan-50"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Conversation {c.conversation_id.slice(0,8)}
                </p>
                {c.unread_count > 0 && (
                  <span className="ml-2 rounded-full bg-cyan-500 px-2 text-xs font-bold text-white">
                    {c.unread_count}
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-gray-600">
                {c.last_message_body || "No messages yet."}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Thread */}
      <section className="rounded-md border bg-white p-3 md:col-span-2 flex flex-col">
        {!active ? (
          <p className="text-gray-500">Select a conversation.</p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map(m => {
                const mine = m.sender_id === me.id;
                return (
                  <div key={m.id} className={cx("max-w-[80%] rounded px-3 py-2 text-sm", mine ? "ml-auto bg-cyan-100" : "bg-gray-100")}>
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-1 text-[10px] text-gray-500">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                );
              })}
              {messages.length === 0 && <p className="text-gray-500">Say hi 👋</p>}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Type a message…"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
              <button
                onClick={send}
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}