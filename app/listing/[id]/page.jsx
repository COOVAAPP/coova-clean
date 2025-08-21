"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BookingForm from "@/components/BookingForm";

export default function ListingPage({ params }) {
  const { id } = params;
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* ... listing details ... */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Book this space</h2>
        <BookingForm listingId={id} />
      </div>
    </main>
  )
}

export const dynamic = "force-dynamic"; // always fetch fresh

const BUCKET = "listing-images";

export default function ListingDetailPage() {
  const { id } = useParams();         // dynamic route param
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [activeUrl, setActiveUrl] = useState(""); // main image url
  const [thumbs, setThumbs] = useState([]);       // other image urls
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!id) return;

        // 1) Fetch listing
        const { data: l, error: lErr } = await supabase
          .from("listings")
          .select("id, owner_id, title, description, price_cents, address, images, created_at")
          .eq("id", id)
          .maybeSingle();

        if (lErr) throw lErr;
        if (!l) {
          // Not found → go to /not-found
          router.replace("/not-found");
          return;
        }

        // 2) Expand image paths to public URLs
        const urls = (l.images || []).map((p) =>
          supabase.storage.from(BUCKET).getPublicUrl(p).data.publicUrl
        );

        // 3) Fetch host profile (optional fields if you added them)
        const { data: h } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_path")
          .eq("id", l.owner_id)
          .maybeSingle();

        const avatarUrl = h?.avatar_path
          ? supabase.storage.from("avatars").getPublicUrl(h.avatar_path).data.publicUrl
          : null;

        if (!mounted) return;

        setListing(l);
        setHost(h ? { ...h, avatar_url: avatarUrl } : null);
        setActiveUrl(urls[0] || "");
        setThumbs(urls.slice(1));
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || "Failed to load listing");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, router]);

  const price = useMemo(() => {
    if (!listing) return "";
    const dollars = (listing.price_cents || 0) / 100;
    return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }, [listing]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
        <div className="mt-8 h-6 w-64 bg-gray-200 rounded" />
        <div className="mt-2 h-4 w-96 bg-gray-200 rounded" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Listing</h1>
        <p className="mt-3 text-red-600">{error}</p>
      </main>
    );
  }

  if (!listing) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Gallery */}
      <section className="rounded-lg border border-gray-200 bg-white p-3">
        {activeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeUrl}
            alt={listing.title}
            className="h-[380px] w-full rounded-md object-cover"
          />
        ) : (
          <div className="h-[380px] w-full rounded-md bg-gray-100" />
        )}

        {thumbs.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[activeUrl, ...thumbs].filter(Boolean).map((u, idx) => (
              <button
                key={u + idx}
                type="button"
                onClick={() => setActiveUrl(u)}
                className={`relative overflow-hidden rounded border ${u === activeUrl ? "ring-2 ring-cyan-500" : ""}`}
                title="View photo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Title + Price + Host */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{listing.title}</h1>
          <p className="mt-1 text-gray-600">{listing.address || "No address provided"}</p>

          <div className="mt-5 prose max-w-none">
            <p className="whitespace-pre-wrap">{listing.description || "No description yet."}</p>
          </div>
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 h-fit">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-extrabold">{price}</p>
            <span className="text-sm text-gray-500">per booking</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {host?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={host.avatar_url}
                alt="Host"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-cyan-500 text-white grid place-items-center font-bold">
                {initialsFromProfile(host)}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Hosted by</p>
              <p className="font-semibold">
                {host?.first_name || host?.last_name
                  ? `${host?.first_name ?? ""} ${host?.last_name ?? ""}`.trim()
                  : "COOVA Host"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/booking/${listing.id}`)}
            className="mt-5 w-full rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black"
          >
            Request to book
          </button>
        </aside>
      </section>

      {/* Meta */}
      <section className="mt-6 text-sm text-gray-500">
        <p>Posted {new Date(listing.created_at).toLocaleDateString()}</p>
      </section>
    </main>
  );
}

function initialsFromProfile(host) {
  const f = (host?.first_name || "").trim();
  const l = (host?.last_name || "").trim();
  const first = f ? f[0] : "";
  const last = l ? l[0] : "";
  const combined = (first + last) || "C";
  return combined.toUpperCase();
}