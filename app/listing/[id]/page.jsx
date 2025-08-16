import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export const revalidate = 30;

export default async function ListingDetail({ params }) {
  const id = params.id;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <main className="container-page py-8">
        <h1 className="text-2xl font-bold">Listing</h1>
        <p className="text-red-600 mt-2">Error: {error.message}</p>
      </main>
    );
  }
  if (!listing) {
    return (
      <main className="container-page py-8">
        <h1 className="text-2xl font-bold">Listing</h1>
        <p className="mt-2">Not found.</p>
      </main>
    );
  }

  const images =
    (Array.isArray(listing.image_urls) && listing.image_urls.length > 0
      ? listing.image_urls
      : [listing.image_url].filter(Boolean)) || [];

  const cover =
    images[0] ||
    "https://images.unsplash.com/photo-1505692794403-34d4982a83be?q=80&w=1600&auto=format&fit=crop";

  return (
    <main className="container-page py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Cover" className="h-full w-full object-cover" />
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.slice(1, 9).map((src, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] overflow-hidden rounded-lg border border-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description / details */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-gray-700 mt-2 whitespace-pre-line">
              {listing.description || "No description provided."}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded border border-gray-200 p-3">
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">
                  {[listing.city, listing.state].filter(Boolean).join(", ") || "N/A"}
                </div>
              </div>
              <div className="rounded border border-gray-200 p-3">
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium">{listing.category || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking / contact card */}
        <aside>
          <div className="rounded-xl border border-gray-200 p-5 sticky top-6">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-brand-700">
                ${Number(listing.price || 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">per hour</div>
            </div>

            <button
              className="mt-4 w-full rounded bg-brand-600 text-white font-semibold py-2.5 hover:bg-brand-700"
              onClick={() => {
                const subject = encodeURIComponent(`Inquiry about "${listing.title}"`);
                const body = encodeURIComponent(
                  `Hi, I'm interested in booking "${listing.title}".\n\nLink: ${process.env.NEXT_PUBLIC_SITE_URL || ''}/listing/${listing.id}\n\nDates / times:\nGuests:\nSpecial requests:\n\nThanks!`
                );
                window.location.href = `mailto:${listing.contact_email || "hello@example.com"}?subject=${subject}&body=${body}`;
              }}
            >
              Contact / Book
            </button>

            <div className="mt-3 text-sm text-gray-600">
              Hosted by <span className="font-medium">{listing.host_name || "Host"}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}