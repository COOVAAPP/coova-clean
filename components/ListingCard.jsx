"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ListingCard({ listing, showMessage = true }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const {
    id,
    title,
    city,
    price_per_hour,
    listing_cover_url, // or image_url depending on your schema
  } = listing || {};

  async function onMessageClick(e) {
    // don't let the card's <Link> navigate
    e?.preventDefault?.();
    e?.stopPropagation?.();

    setSending(true);

    // Require auth
    const { data: s } = await supabase.auth.getSession();
    const me = s?.session?.user;
    if (!me) {
      setSending(false);
      alert("Please sign in to message the host.");
      return;
    }

    try {
      // We need owner id for the conversation.
      // Ensure your /api/browse (or wherever you fetch listings) includes owner_id in the result.
      const ownerId = listing?.owner_id;
      if (!ownerId) throw new Error("Missing owner_id on listing.");

      // Use the same RPC that powers the “Message host” button in the listing page
      const { data, error } = await supabase.rpc("upsert_conversation", {
        _listing: id,
        _u1: me.id,
        _u2: ownerId,
      });
      if (error) throw error;

      router.push(`/messages?c=${data}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to open conversation.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Link
      href={`/listing/${id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-50">
        {listing_cover_url ? (
          <Image
            src={listing_cover_url}
            alt={title || "Listing"}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="line-clamp-1 text-sm font-semibold">{title || "Listing"}</p>
        <p className="mt-1 text-xs text-gray-500">{city || ""}</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-bold">
            ${Number(price_per_hour ?? 0).toLocaleString()}
            <span className="ml-1 text-xs font-normal text-gray-500">/ hour</span>
          </p>

          {showMessage && (
            <button
              onClick={onMessageClick}
              disabled={sending}
              className="rounded-full border px-3 py-1 text-xs font-semibold text-cyan-700 border-cyan-600 hover:bg-cyan-50 disabled:opacity-60"
              title="Message host"
            >
              {sending ? "…" : "Message"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}