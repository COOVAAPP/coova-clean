// app/listing/[id]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AmenityPill from "@/components/AmenityPill";
import BookingForm from "@/components/BookingForm";
import MessageHostButton from "@/components/MessageHostButton";

export const dynamic = "force-dynamic";

/* ----------------------------- Supabase (server) ---------------------------- */
async function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getListingWithExtras(id) {
  const supabase = await getClient();

  // Select ONLY columns that exist in your schema:
  // id, title, description, image_url (cover), image_urls (jsonb array),
  // price_per_hour, owner_id, amenities
  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        description,
        image_url,
        image_urls,
        price_per_hour,
        owner_id,
        amenities,
        profiles:owner_id (
          id,
          first_name,
          last_name,
          avatar_url,
          bio
        )
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }

  // Related by same owner (simple + safe). Uses only existing columns.
  const { data: related } = await supabase
    .from("listings")
    .select("id,title,image_url,price_per_hour")
    .eq("owner_id", listing.owner_id)
    .neq("id", id)
    .limit(6);

  return { listing, related: related ?? [] };
}

/* --------------------------------- Helpers --------------------------------- */
function money(numeric) {
  // your DB stores price_per_hour as numeric dollars (e.g. 125)
  const n = Number(numeric ?? 0);
  return `$${n.toLocaleString()}`;
}

/* ----------------------------------- Page ---------------------------------- */
export default async function ListingPage({ params }) {
  const { id } = params;
  const data = await getListingWithExtras(id);
  if (!data?.listing) notFound();

  const { listing, related } = data;

  const title = listing.title || "Untitled listing";
  const pricePerHour = listing.price_per_hour ?? 0;
  const ownerId = listing.owner_id;

  // cover + gallery (image_urls is jsonb array of strings)
  const coverUrl = listing.image_url || (Array.isArray(listing.image_urls) ? listing.image_urls[0] : null);
  const gallery = Array.isArray(listing.image_urls) ? listing.image_urls.filter(Boolean) : [];

  // amenities may be jsonb array or text[]
  const amenities =
    Array.isArray(listing.amenities) ? listing.amenities : (listing.amenities?.items ?? []);

  const host = listing.profiles || null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Title + price */}
      <header className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">{title}</h1>
        <div className="text-right">
          <p className="text-xs text-gray-500">From</p>
          <p className="text-2xl font-extrabold">
            {money(pricePerHour)}{" "}
            <span className="ml-1 text-sm font-normal text-gray-500">/ hour</span>
          </p>
        </div>
      </header>

      {/* Cover */}
      <section className="mt-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {coverUrl ? (
            // Use plain <img> to avoid next/image domain config issues
            <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No photo</div>
          )}
        </div>
      </section>

      {/* Main grid */}
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-2 space-y-8">
          {/* Gallery */}
          {gallery.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Gallery</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((src, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-md border">
                    <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About */}
          <section>
            <h2 className="text-lg font-semibold">About this space</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {listing.description || "No description yet."}
            </p>
          </section>

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a, i) => (
                  <AmenityPill key={`${String(a)}-${i}`} name={String(a)} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews (stub) */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <Link
                href={`/listing/${listing.id}/reviews`}
                className="text-sm font-medium text-cyan-600 hover:underline"
              >
                See all
              </Link>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Reviews coming soon. (We’ll wire your reviews table and ratings aggregate.)
            </p>
          </section>
        </div>

        {/* Right column */}
        <aside className="md:col-span-1 space-y-8">
          {/* Booking card */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-base font-semibold">Book this space</h3>
            <div className="mt-4">
              <BookingForm
                listingId={listing.id}
                priceCents={Math.round(Number(pricePerHour) * 100)}
                ownerId={ownerId}
                onSuccessRedirect="/dashboard/bookings"
              />
            </div>
          </div>

          {/* Host card */}
          {host && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-base font-semibold">Host</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-cyan-500">
                  {host.avatar_url ? (
                    <img
                      src={host.avatar_url}
                      alt="Host avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white font-bold">
                      {((host.first_name?.[0] || host.last_name?.[0] || "U") + "").toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {[host.first_name, host.last_name].filter(Boolean).join(" ") || "Host"}
                  </p>
                  <p className="text-xs text-gray-500" />
                </div>
              </div>
              {host.bio && <p className="mt-3 text-sm text-gray-700">{host.bio}</p>}
              <Link
                href={`/profile/${host.id}`}
                className="mt-4 inline-block text-sm font-medium text-cyan-600 hover:underline"
              >
                View profile
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* Related listings */}
      {related?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">More from this host</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/listing/${r.id}`}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow"
              >
                <div className="relative aspect-[4/3] w-full bg-gray-50">
                  {r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.title || "Listing"}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold">{r.title || "Listing"}</p>
                  <p className="mt-2 text-sm font-bold">{money(r.price_per_hour)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}