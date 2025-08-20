export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createServerSupabase } from "@/lib/supabaseServer"; // server client wrapper (see below)
import Link from "next/link";

// simple server-side supabase client
// lib/supabaseServer.js must export createServerClient()
export const dynamicParams = true;

export default async function PublicListingPage({ params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from("listings")
    .select("id,title,price,description,images,status")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return (
      <main className="container-page py-10">
        <h1 className="text-xl font-bold">Listing not found</h1>
        <p className="mt-2">This listing may be private or doesn’t exist.</p>
        <Link href="/" className="btn mt-4">Back Home</Link>
      </main>
    );
  }

  const imgs = Array.isArray(data.images) ? data.images : [];

  return (
    <main className="container-page py-10 max-w-5xl">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>

      {imgs.length > 0 ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 mb-6">
          {imgs.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={u} src={u} alt="" className="w-full h-48 object-cover rounded" />
          ))}
        </div>
      ) : null}

      <div className="text-lg font-semibold mb-2">${data.price} / hour</div>
      <p className="mb-6 whitespace-pre-wrap">{data.description}</p>

      <Link href={`/book/${data.id}`} className="btn primary">Request Booking</Link>
    </main>
  );
}