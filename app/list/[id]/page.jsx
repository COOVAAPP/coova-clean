import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function ListingDetail({ params }) {
  const { id } = params;

  const [{ data: listing }, { data: assets }] = await Promise.all([
    supabase
      .from("listings")
      .select("id,title,price,description,is_public")
      .eq("id", id)
      .single(),
    supabase
      .from("listing_assets")
      .select("*")
      .eq("listing_id", id)
      .order("type", { ascending: true })
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (!listing) {
    return <main className="container-page py-10">Listing not found.</main>;
  }

  const images = (assets || []).filter(a => a.type === "image");
  const video  = (assets || []).find(a => a.type === "video");

  return (
    <main className="container-page py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media: gallery + optional video */}
        <div className="space-y-6">
          {/* Gallery */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].url}
                alt={listing.title}
                className="col-span-2 w-full h-auto rounded border object-cover"
              />
              {images.slice(1).map(img => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.url} alt="" className="w-full h-36 rounded border object-cover" />
              ))}
            </div>
          ) : (
            <div className="rounded border p-6 text-gray-500">No photos yet.</div>
          )}

          {/* Video */}
          {video ? (
            <video
              src={video.url}
              controls
              className="w-full rounded border"
            />
          ) : null}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="mt-2 text-2xl font-semibold text-brand-600">
            ${Number(listing.price || 0).toFixed(0)} <span className="text-sm text-gray-500">/ hour</span>
          </p>

          {listing.description ? (
            <p className="mt-6 text-gray-700 whitespace-pre-line">{listing.description}</p>
          ) : null}

          <div className="mt-8 flex gap-3">
            <a className="btn primary" href="mailto:host@example.com">Contact Host</a>
            <a className="btn" href="#">Request Booking</a>
          </div>
        </div>
      </div>
    </main>
  );
}