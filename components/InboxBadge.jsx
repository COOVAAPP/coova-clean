// components/InboxBadge.jsx
"use client";
import { useEffect, useState } from "react";

export default function InboxBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/inbox/unread", { cache: "no-store" });
        const json = await res.json();
        if (alive) setCount(json.count || 0);
      } catch {}
    };
    load();

    // refresh every 30s (lightweight)
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!count) return null;

  return (
    <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
      {count}
    </span>
  );
}