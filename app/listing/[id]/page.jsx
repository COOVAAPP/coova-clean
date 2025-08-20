// /app/listing/[id]/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ListingDetail({ params }) {
  const { id } = params;

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold">Listing #{id}</h1>
      <p className="mt-2 text-gray-600">Details coming soon…</p>
    </main>
  );
}