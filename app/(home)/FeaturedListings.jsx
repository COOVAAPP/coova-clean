// app/(home)/FeaturedListings.jsx
import supabase from "@/lib/supabaseServer";
import ListingCard from "@/components/ListingCard";

export const revalidate = 30; // ISR: refresh every 30s

export default async function FeaturedListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load listings.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No listings yet. <a href="/list" className="underline">Be the first to host.</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => <ListingCard key={item.id} item={item} />)}
    </div>
  );
}