// components/CategoryCard.jsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses public anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function CategoryCardGrid() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("name, slug, image_url, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading categories:", error);
    return null;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {categories?.map((c) => (
        <Link
          key={c.slug}
          href={`/browse?type=${c.slug}`}
          className="group relative h-56 overflow-hidden rounded-xl shadow hover:shadow-lg transition"
        >
          <img
            src={c.image_url}
            alt={c.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40" />
          <span className="absolute inset-x-0 bottom-0 p-4 text-lg font-semibold text-white">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}