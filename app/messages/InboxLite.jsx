"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InboxLite() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const json = await res.json();
      setItems(json.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!items.length) return <p className="text-gray-500">No conversations yet.</p>;

  return (
    <ul className="divide-y rounded-md border bg-white">
      {items.map((c) => (
        <li key={c.id} className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <Link href={`/inbox/${c.id}`} className="block font-semibold hover:underline">
              {c.other?.first_name || c.other?.last_name
                ? `${c.other?.first_name ?? ""} ${c.other?.last_name ?? ""}`.trim()
                : "Conversation"}
            </Link>
            <p className="mt-1 line-clamp-1 text-sm text-gray-600">
              {c.last_message?.body ||
                (c.last_message?.attachment_path ? "📎 Attachment" : "No messages yet")}
            </p>
          </div>

          {c.unread_count > 0 && (
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-cyan-600 px-2 text-xs font-bold text-white">
              {c.unread_count}
            </span>
          )}

          <Link
            href={`/inbox/${c.id}`}
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Open
          </Link>
        </li>
      ))}
    </ul>
  );
}