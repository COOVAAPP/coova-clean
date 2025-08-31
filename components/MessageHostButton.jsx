// components/MessageHostButton.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MessageHostButton({ listingId, ownerId, className = "" }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  async function startConversation() {
    setErr("");
    setSending(true);

    // 1) Require auth
    const { data: s } = await supabase.auth.getSession();
    const me = s?.session?.user;
    if (!me) {
      setSending(false);
      // Use whatever auth flow you prefer:
      alert("Please sign in to message the host.");
      return;
    }

    try {
      // 2) Create or fetch the conversation (sorted pair)
      const { data, error } = await supabase.rpc("upsert_conversation", {
        _listing: listingId,
        _u1: me.id,
        _u2: ownerId,
      });
      if (error) throw error;

      // 3) Go to inbox with that conversation preselected
      router.push(`/messages?c=${data}`);
    } catch (e) {
      setErr(e?.message || "Failed to start conversation");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={startConversation}
        disabled={sending}
        className="w-full rounded-md border border-cyan-600 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50 disabled:opacity-60"
      >
        {sending ? "Opening…" : "Message host"}
      </button>
      {err && (
        <p className="mt-2 text-xs text-red-600">{err}</p>
      )}
    </div>
  );
}