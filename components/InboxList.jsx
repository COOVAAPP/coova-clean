// components/InboxList.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listConversations } from "@/lib/inboxClient";

export default function InboxList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await listConversations());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!items.length) return <p className="text-gray-500">No conversations yet.</p>;

  return (
    <ul className="divide-y rounded-md border bg-white">
      {items.map((c) => (
        <li key={c.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Conversation</p>
            {c.listing_id ? (
              <p className="text-xs text-gray-500">Listing: {c.listing_id}</p>
            ) : null}
          </div>

          {c.unread_count > 0 && (
            <span className="rounded-full bg-cyan-600/10 text-cyan-700 px-2 py-0.5 text-xs">
              {c.unread_count}
            </span>
          )}

          <Link
            href={`/inbox/${c.id}`}
            className="ml-4 rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Open
          </Link>
        </li>
      ))}
    </ul>
  );
}