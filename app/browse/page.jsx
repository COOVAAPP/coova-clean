import { createClient } from "@supabase/supabase-js";
import ListingCard from "@/components/ListingCard";
import Pagination from "@/components/Pagination";
import Filters from "./Filters";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export const revalidate = 30;

export default async function BrowsePage({ searchParams }) {
  const q = (searchParams?.q || "").trim();
  const category = (searchParams?.category || "").trim();
  const min = searchParams?.min ? Number(searchParams.min) : undefined;
  const max = searchParams?.max ? Number(searchParams.max) : undefined;
  const sort = searchParams?.sort || "new";
  const page = Math.max(1, Number(searchParams?.page || 1));
  const perPage = Math.min(24, Math.max(6, Number(searchParams?.perPage || 12)));

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active");

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (typeof min === "number" && !Number.isNaN(min)) query = query.gte("price", min);
  if (typeof max === "number" && !Number.isNaN(max)) query = query.lte("price", max);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return (
      <main className="container-page py-8">
        <h1 className="text-2xl font-bold mb-4">Browse</h1>
        <p className="text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">Browse</h1>

      <div className="mb-6">
        {/* Filters (client) */}
        <Filters />
      </div>

      {(!data || data.length === 0) && (
        <p className="text-gray-600">No results found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      <Pagination page={page} perPage={perPage} total={count || 0} />
    </main>
  );
}