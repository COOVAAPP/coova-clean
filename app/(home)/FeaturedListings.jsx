// /app/(home)/FeaturedListings.jsx
export const revalidate = 30; // ISR refresh every 30s

export default async function FeaturedListings() {
  return (
    <section className="container-page py-8">
      <h2 className="text-xl font-semibold">Featured Listings</h2>
      <p className="mt-2 text-gray-600">Coming soon…</p>
    </section>
  );
}