// lib/inboxClient.js
export async function listConversations() {
  const res = await fetch("/api/inbox", { cache: "no-store" });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load inbox");
  return (await res.json()).items || [];
}

export async function fetchMessages(conversationId, { limit = 50, cursor = null } = {}) {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);
  const res = await fetch(`/api/inbox/${conversationId}/messages?` + qs.toString(), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load messages");
  return await res.json(); // { items, nextCursor }
}

export async function sendMessage(conversationId, { content, attachment_url } = {}) {
  const res = await fetch(`/api/inbox/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, attachment_url }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to send message");
  return (await res.json()).item;
}

export async function markThreadRead(conversationId) {
  const res = await fetch(`/api/inbox/${conversationId}/read`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to mark read");
  return true;
}