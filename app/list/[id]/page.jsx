"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function ListingViewPage({ params }) {
  const listingId = params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      // fetch main listing
      const { data: l, error: lErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();
      if (lErr) {
        console.error(lErr);
        setLoading(false);
        return;
      }

      // fetch images
      const { data: imgs } = await supabase
        .from("listing_assets")
        .select("*")
        .eq("listing_id", listingId)
        .eq("type", "image")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      // fetch video
      const { data: vid } = await supabase
        .from("listing_assets")
        .select("*")
        .eq("listing_id", listingId)
        .eq("type", "video")
        .limit(1)
        .maybeSingle();

      if (active) {
        setListing(l);
        setImages(imgs || []);
        setVideo(vid || null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <main className="container-page py-16">
        <p className="text-gray-600">Loading…</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="container-page py-16">
        <p className="text-red-600">Listing not found.</p>
      </main>
    );
  }

  return (
    <main className="container-page py-10 space-y-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="text-gray-600">${listing.price} / hour</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/list/${listingId}/edit`)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Edit
          </button>
          <button
            onClick={() => router.push(`/list/${listingId}/book`)}
            className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
          >
            Book Now
          </button>
        </div>
      </header>

      {/* Photos */}
      {images?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="rounded-md object-cover w-full h-40"
              />
            ))}
          </div>
        </section>
      )}

      {/* Video */}
      {video && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Promo Video</h2>
          <video
            src={video.url}
            controls
            className="w-full rounded border"
          />
        </section>
      )}

      {/* Description */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="whitespace-pre-wrap text-gray-800">
          {listing.description || "No description provided."}
        </p>
      </section>
    </main>
  );
}