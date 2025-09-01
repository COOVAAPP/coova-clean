// app/messages/MessagesClient.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

/**
 * Features:
 * - Infinite scroll (older pages) with cursor on created_at
 * - Read receipts (conversation_participants.last_read_at)
 * - Typing indicators (Realtime Presence)
 * - Attachments: images & files with preview, upload, progress, and render
 *
 * Storage:
 *   bucket: "message-attachments" (public)
 *
 * Schema expectations:
 * conversations(id, listing_id, created_at)
 * conversation_participants(conversation_id, user_id, last_read_at timestamptz NULL)
 * messages(id, conversation_id, sender_id, body, attachments jsonb[], created_at timestamptz)
 * listings(id, title, listing_cover_url)
 * profiles(id, first_name, last_name, avatar_url)
 */

const PAGE_SIZE = 30;
const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const BUCKET = "message-attachments";
const ALLOWED_TYPES = [
  // images
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
  // docs (add more if you want)
  "application/pdf",
];

function cx(...x) {
  return x.filter(Boolean).join(" ");
}
function initials(p) {
  const f = (p?.first_name || "").trim();
  const l = (p?.last_name || "").trim();
  return (f[0] || l[0] || "U").toUpperCase();
}
function prettyTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}
function isImage(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

export default function MessagesClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const requestedId = sp.get("c") || null;

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  // Left list
  const [inbox, setInbox] = useState([]); // [{conversation_id, listing, other, lastMessage, my_part, other_part, unreadCount}]
  const [active, setActive] = useState(null);

  // Active thread state
  const [messages, setMessages] = useState([]); // ascending time
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Composer
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Attachments (to be sent with next message)
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // {url, name, size, type}
  const [uploadErr, setUploadErr] = useState("");
  const fileInputRef = useRef(null);

  // Typing presence
  const [othersTyping, setOthersTyping] = useState([]); // [{user_id, name}]
  const presenceRef = useRef(null);

  // scroll & realtime
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const realtimeRef = useRef(null);
  const earliestRef = useRef(null);
  const loadingInitialRef = useRef(false);

  /* Load session */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setMe(data?.session?.user || null);
      setLoadingMe(false);
    })();

    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      setMe(session?.user || null);
    });

    return () => sub?.data?.subscription?.unsubscribe?.();
  }, []);

  if (!loadingMe && !me) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
        You must be signed in to view your inbox.{" "}
        <button
          className="font-semibold text-cyan-700 underline"
          onClick={() => router.push("/login?next=/messages")}
        >
          Sign in
        </button>
        .
      </div>
    );
  }

  /* Fetch inbox (conversations + previews + last_read_at + unreadCount) */
  const fetchInbox = useCallback(async () => {
    if (!me) return;

    const { data: parts, error: pErr } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id, last_read_at")
      .eq("user_id", me.id);

    if (pErr) {
      console.error(pErr);
      return;
    }
    const ids = (parts || []).map((p) => p.conversation_id);
    if (ids.length === 0) {
      setInbox([]);
      setActive(null);
      return;
    }

    const { data: convos, error: cErr } = await supabase
      .from("conversations")
      .select("id, listing_id, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (cErr) {
      console.error(cErr);
      return;
    }

    const rows = await Promise.all(
      (convos || []).map(async (c) => {
        // my participant row
        const my_part = (parts || []).find(
          (p) => p.conversation_id === c.id && p.user_id === me.id
        ) || { last_read_at: null };

        // other participant
        const { data: others } = await supabase
          .from("conversation_participants")
          .select("user_id, last_read_at")
          .eq("conversation_id", c.id)
          .neq("user_id", me.id)
          .limit(1);

        const otherId = others?.[0]?.user_id || null;
        const other_part = others?.[0] || null;

        let other = null;
        if (otherId) {
          const { data: p } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", otherId)
            .single();
          other = p || null;
        }

        // listing
        let listing = null;
        if (c.listing_id) {
          const { data: l } = await supabase
            .from("listings")
            .select("id, title, listing_cover_url")
            .eq("id", c.listing_id)
            .single();
          listing = l || null;
        }

        // last message (include attachments for preview)
        const { data: last } = await supabase
          .from("messages")
          .select("id, body, attachments, sender_id, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage = last?.[0] || null;

        // unread count
        let unreadCount = 0;
        if (my_part?.last_read_at) {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", c.id)
            .gt("created_at", my_part.last_read_at)
            .neq("sender_id", me.id);
          unreadCount = count || 0;
        } else {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", c.id)
            .neq("sender_id", me.id);
          unreadCount = count || 0;
        }

        return {
          conversation_id: c.id,
          created_at: c.created_at,
          listing,
          other,
          my_part,
          other_part,
          lastMessage,
          unreadCount,
        };
      })
    );

    // sort by last activity
    rows.sort((a, b) => {
      const atA = a.lastMessage?.created_at || a.created_at || "";
      const atB = b.lastMessage?.created_at || b.created_at || "";
      return (atB || "").localeCompare(atA || "");
    });

    setInbox(rows);

    // pick active
    if (requestedId) {
      const hit = rows.find((r) => r.conversation_id === requestedId);
      setActive(hit ? hit.conversation_id : rows[0]?.conversation_id || null);
    } else {
      setActive((a) => a || rows[0]?.conversation_id || null);
    }
  }, [me, requestedId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  /* Helpers to mark read */
  const markRead = useCallback(
    async (conversation_id) => {
      if (!me || !conversation_id) return;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("conversation_participants")
        .update({ last_read_at: now })
        .eq("conversation_id", conversation_id)
        .eq("user_id", me.id);

      if (error) console.error(error);

      setInbox((prev) =>
        prev.map((row) =>
          row.conversation_id === conversation_id
            ? { ...row, my_part: { ...row.my_part, last_read_at: now }, unreadCount: 0 }
            : row
        )
      );
    },
    [me]
  );

  /* Load messages for active, with pagination & realtime */
  const loadInitial = useCallback(async () => {
    if (!active) return;
    loadingInitialRef.current = true;

    const { data, error } = await supabase
      .from("messages")
      .select("id, body, attachments, sender_id, created_at")
      .eq("conversation_id", active)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error(error);
      loadingInitialRef.current = false;
      return;
    }

    const items = (data || []).reverse();
    setMessages(items);
    earliestRef.current = items[0]?.created_at || null;

    setHasMoreOlder(items.length === PAGE_SIZE);

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 0);

    await markRead(active);

    // realtime subscribe for inserts
    realtimeRef.current?.unsubscribe?.();
    realtimeRef.current = supabase
      .channel(`messages:conversation_id=eq.${active}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);

          setInbox((prev) =>
            prev
              .map((row) => {
                if (row.conversation_id !== active) return row;
                const isMine = payload.new.sender_id === me?.id;
                const nextUnread = isMine ? row.unreadCount : 0;
                return { ...row, lastMessage: payload.new, unreadCount: nextUnread };
              })
              .sort((a, b) => {
                const atA = a.lastMessage?.created_at || a.created_at || "";
                const atB = b.lastMessage?.created_at || b.created_at || "";
                return (atB || "").localeCompare(atA || "");
              })
          );

          const el = scrollRef.current;
          if (el) {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
            if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }

          if (payload.new.sender_id !== me?.id) markRead(active);
        }
      )
      .subscribe();

    loadingInitialRef.current = false;
  }, [active, markRead, me?.id]);

  useEffect(() => {
    if (!active) {
      setMessages([]);
      earliestRef.current = null;
      presenceRef.current?.unsubscribe?.();
      realtimeRef.current?.unsubscribe?.();
      setOthersTyping([]);
      return;
    }
    setMessages([]);
    earliestRef.current = null;
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* Infinite scroll (load older) */
  const loadOlder = useCallback(async () => {
    if (!active || !earliestRef.current || loadingOlder) return;
    setLoadingOlder(true);
    const before = earliestRef.current;

    const { data, error } = await supabase
      .from("messages")
      .select("id, body, attachments, sender_id, created_at")
      .eq("conversation_id", active)
      .lt("created_at", before)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error(error);
      setLoadingOlder(false);
      return;
    }

    const chunk = (data || []).reverse();
    setMessages((prev) => [...chunk, ...prev]);

    if (chunk.length === PAGE_SIZE) {
      setHasMoreOlder(true);
      earliestRef.current = chunk[0]?.created_at || earliestRef.current;
    } else {
      setHasMoreOlder(false);
      earliestRef.current = chunk[0]?.created_at || earliestRef.current;
    }
    setLoadingOlder(false);
  }, [active, loadingOlder]);

  const onScroll = useCallback(
    (e) => {
      const el = e.currentTarget;
      if (el.scrollTop < 80 && hasMoreOlder && !loadingOlder && !loadingInitialRef.current) {
        loadOlder();
      }
    },
    [hasMoreOlder, loadingOlder, loadOlder]
  );

  /* Typing presence */
  useEffect(() => {
    if (!active || !me) return;

    presenceRef.current?.unsubscribe?.();
    setOthersTyping([]);

    const chan = supabase.channel(`presence:conv:${active}`, {
      config: { presence: { key: me.id } },
    });

    presenceRef.current = chan;

    chan.on("presence", { event: "sync" }, () => {
      const state = chan.presenceState();
      const all = Object.values(state).flat();
      const others = all.filter((x) => x.user_id !== me.id && x.typing);
      setOthersTyping(
        others.map((x) => ({
          user_id: x.user_id,
          name: x.name || "User",
        }))
      );
    });

    chan.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", me.id)
          .single();
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "You";
        chan.track({ user_id: me.id, name, typing: false, at: Date.now() });
      }
    });

    return () => {
      chan.unsubscribe();
    };
  }, [active, me]);

  const typingTimeoutRef = useRef(null);
  const setTyping = useCallback((isTyping) => {
    const chan = presenceRef.current;
    if (!chan || !me) return;
    chan.track({ user_id: me.id, typing: !!isTyping, at: Date.now() }, { ack: false });
  }, [me]);

  const onChangeInput = useCallback((val) => {
    setInput(val);
    setTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1200);
  }, [setTyping]);

  /* Attachments: selection + previews */
  useEffect(() => {
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      type: f.type,
      _temp: true, // local preview flag
    }));
    setPreviews(urls);
    return () => urls.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const onPickFiles = (e) => {
    setUploadErr("");
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;

    const current = [...files];
    for (const f of list) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setUploadErr("Only images (JPG/PNG/WebP/AVIF/GIF) and PDFs are allowed.");
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setUploadErr(`Max file size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`);
        continue;
      }
      if (current.length >= MAX_FILES) {
        setUploadErr(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      current.push(f);
    }
    setFiles(current);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx) => setFiles((arr) => arr.filter((_, i) => i !== idx));

  /* Upload helper */
  async function uploadOne(file, conversation_id, user_id) {
    const safe = file.name.replace(/\s+/g, "_");
    const key = `${conversation_id}/${user_id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safe}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);

    return {
      url: pub.publicUrl,
      name: file.name,
      type: file.type,
      size: file.size,
      path: key,
    };
  }

  /* Send message (with attachments) */
  async function sendMessage() {
    const body = input.trim();
    if (!active || !me) return;
    if (!body && files.length === 0) return;

    setSending(true);

    try {
      // upload all attachments first
      let atts = [];
      for (const f of files) {
        // eslint-disable-next-line no-await-in-loop
        const a = await uploadOne(f, active, me.id);
        atts.push(a);
      }

      // optimistic
      const tmpId = `tmp_${Date.now()}`;
      const optimistic = {
        id: tmpId,
        conversation_id: active,
        sender_id: me.id,
        body,
        attachments: atts,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      // insert
      const { error } = await supabase.from("messages").insert({
        conversation_id: active,
        sender_id: me.id,
        body,
        attachments: atts, // jsonb[]
      });
      if (error) throw error;

      // clear composer
      setInput("");
      setFiles([]);
      setUploadErr("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTyping(false);
      // keep scrolled to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    } catch (e) {
      // rollback optimistic
      setMessages((prev) => prev.filter((m) => !String(m.id).startsWith("tmp_")));
      alert(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  }

  const activeMeta = useMemo(
    () => inbox.find((x) => x.conversation_id === active) || null,
    [inbox, active]
  );

  const seenMyLast = useMemo(() => {
    if (!activeMeta?.other_part?.last_read_at || messages.length === 0) return false;
    const myLast = [...messages].reverse().find((m) => m.sender_id === me?.id);
    if (!myLast) return false;
    return new Date(activeMeta.other_part.last_read_at) >= new Date(myLast.created_at);
  }, [activeMeta?.other_part?.last_read_at, messages, me?.id]);

  // refresh other_part.last_read_at occasionally
  useEffect(() => {
    if (!active) return;
    const t = setInterval(async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("user_id, last_read_at")
        .eq("conversation_id", active)
        .neq("user_id", me?.id)
        .limit(1);
      const other_part = data?.[0] || null;
      if (other_part) {
        setInbox((prev) =>
          prev.map((row) =>
            row.conversation_id === active ? { ...row, other_part } : row
          )
        );
      }
    }, 3000);
    return () => clearInterval(t);
  }, [active, me?.id]);

  return (
    <div className="grid gap-6 md:grid-cols-12">
      {/* Sidebar */}
      <aside className="md:col-span-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-2">
            <p className="text-sm font-semibold text-gray-700">Conversations</p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {inbox.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
            ) : (
              inbox.map((row) => {
                const activeRow = row.conversation_id === active;
                const name =
                  [row.other?.first_name, row.other?.last_name].filter(Boolean).join(" ") ||
                  "User";
                const cover = row.listing?.listing_cover_url || null;
                const title = row.listing?.title || "Listing";
                const last =
                  row.lastMessage?.body ||
                  (row.lastMessage?.attachments?.length
                    ? `📎 ${row.lastMessage.attachments.length} attachment${row.lastMessage.attachments.length > 1 ? "s" : ""}`
                    : "");

                const unread = row.unreadCount > 0;

                return (
                  <button
                    key={row.conversation_id}
                    onClick={() => setActive(row.conversation_id)}
                    className={cx(
                      "flex w-full items-center gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-gray-50",
                      activeRow && "bg-cyan-50"
                    )}
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-cyan-500 shrink-0">
                      {row.other?.avatar_url ? (
                        <Image
                          src={row.other.avatar_url}
                          alt={name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                          {initials(row.other)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                          {name}
                        </p>
                        {unread && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyan-600 px-1.5 text-[11px] font-bold text-white">
                            {row.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-xs text-gray-500">{title}</p>
                      {last && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{last}</p>
                      )}
                    </div>

                    {cover ? (
                      <div className="relative hidden h-10 w-14 overflow-hidden rounded md:block">
                        <Image src={cover} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Thread */}
      <section className="md:col-span-8">
        <div className="flex h-[70vh] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            {activeMeta ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-cyan-500">
                    {activeMeta.other?.avatar_url ? (
                      <Image
                        src={activeMeta.other.avatar_url}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white font-bold">
                        {initials(activeMeta.other)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {[activeMeta.other?.first_name, activeMeta.other?.last_name]
                        .filter(Boolean)
                        .join(" ") || "User"}
                    </p>
                    {activeMeta.listing?.id && (
                      <Link
                        href={`/listing/${activeMeta.listing.id}`}
                        className="text-xs text-cyan-700 hover:underline"
                      >
                        {activeMeta.listing.title || "View listing"}
                      </Link>
                    )}
                    {othersTyping.length > 0 && (
                      <p className="text-[11px] text-cyan-700">
                        {othersTyping.map((o) => o.name).join(", ")} typing…
                      </p>
                    )}
                  </div>
                </div>
                {activeMeta.listing?.listing_cover_url ? (
                  <div className="relative hidden h-10 w-16 overflow-hidden rounded md:block">
                    <Image
                      src={activeMeta.listing.listing_cover_url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-gray-600">Select a conversation</p>
            )}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {hasMoreOlder && (
              <div className="mb-2 text-center">
                <button
                  onClick={loadOlder}
                  disabled={loadingOlder}
                  className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingOlder ? "Loading…" : "Load older"}
                </button>
              </div>
            )}

            {!active ? (
              <div className="text-sm text-gray-500">Choose a conversation from the left.</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-gray-500">No messages yet. Say hello 👋</div>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === me?.id;
                const atts = Array.isArray(m.attachments) ? m.attachments : [];
                return (
                  <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cx(
                        "max-w-[80%] rounded-md px-3 py-2 text-sm",
                        mine ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-900"
                      )}
                    >
                      {m.body ? <p className="whitespace-pre-wrap">{m.body}</p> : null}

                      {/* attachments */}
                      {atts.length > 0 && (
                        <div className={cx(m.body ? "mt-2" : "", "space-y-2")}>
                          {atts.map((a, i) =>
                            isImage(a.type) ? (
                              <div key={`${a.url}-${i}`} className="relative overflow-hidden rounded">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={a.url}
                                  alt={a.name || "attachment"}
                                  className="max-h-72 w-full rounded object-cover"
                                />
                                {a.name && (
                                  <p className={cx(
                                    "mt-1 text-[11px]",
                                    mine ? "text-cyan-100/80" : "text-gray-600"
                                  )}>
                                    {a.name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <a
                                key={`${a.url}-${i}`}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className={cx(
                                  "inline-flex items-center gap-2 rounded border px-2 py-1 text-xs",
                                  mine ? "border-cyan-400 hover:bg-cyan-500/10" : "border-gray-300 hover:bg-white"
                                )}
                              >
                                <span>📎</span>
                                <span className="font-medium">{a.name || "Attachment"}</span>
                                {a.size ? (
                                  <span className="text-[10px] opacity-70">
                                    {Math.round(a.size / 1024)} KB
                                  </span>
                                ) : null}
                              </a>
                            )
                          )}
                        </div>
                      )}

                      <p
                        className={cx(
                          "mt-1 text-[10px]",
                          mine ? "text-cyan-100/80" : "text-gray-500"
                        )}
                      >
                        {prettyTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Seen indicator for my last message */}
            {seenMyLast && (
              <div className="mt-2 text-right">
                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                  Seen
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200 p-3">
            {/* selected file previews */}
            {previews.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {previews.map((p, i) => (
                  <div
                    key={`${p.url}-${i}`}
                    className="relative overflow-hidden rounded border border-gray-200 bg-gray-50"
                  >
                    {isImage(p.type) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt={p.name} className="h-20 w-28 object-cover" />
                    ) : (
                      <div className="flex h-20 w-28 items-center justify-center text-xs text-gray-600">
                        📎 {p.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadErr && (
              <div className="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                {uploadErr}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!active) return;
                if (!input.trim() && files.length === 0) return;
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_TYPES.join(",")}
                  multiple
                  onChange={onPickFiles}
                />
                📎 Attach
              </label>

              <input
                value={input}
                onChange={(e) => onChangeInput(e.target.value)}
                placeholder={active ? "Write a message…" : "Select a conversation to start"}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-60"
                disabled={!active || sending}
              />

              <button
                type="submit"
                disabled={!active || sending || (!input.trim() && files.length === 0)}
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}