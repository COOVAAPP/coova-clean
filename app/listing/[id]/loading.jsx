export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </main>
  );
}