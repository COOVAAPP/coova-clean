// app/listing/[id]/page.jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { createClient } from "@supabase/supabase-js";

// --- server-side helper to load a single listing ---
async function getListing(id) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Adjust selected columns to match your schema
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      title,
      description,
      cover_url,
      price_cents,
      owner_id
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    // If the row doesn't exist, let Next show 404
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export const dynamic = "force-dynamic"; // ensures SSR fetch each time (optional)

export default async function ListingPage({ params }) {
  const { id } = params;
  const listing = await getListing(id);

  if (!listing) notFound();

  const {
    title = "Untitled listing",
    description = "",
    cover_url: coverUrl,
    price_cents: priceCents = 0,
    owner_id: ownerId,
  } = listing;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">{title}</h1>

      {/* Media + Booking column */}
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        {/* Left: photo + description */}
        <section className="md:col-span-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {coverUrl ? (
              // If your images are remote, ensure domain is in next.config images.domains
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No photo
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">About this space</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {description || "No description yet."}
            </p>
          </div>
        </section>

        {/* Right: booking card */}
        <aside className="md:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-extrabold">
                  ${(priceCents / 100).toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-gray-500">/ hour</span>
                </p>
              </div>
            </div>

            <div className="mt-6">
              {/* Booking form is a CLIENT component */}
              <BookingForm
                listingId={listing.id}
                priceCents={priceCents}
                ownerId={ownerId}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}