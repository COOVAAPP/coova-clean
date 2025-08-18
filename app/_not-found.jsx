// app/not-found.jsx (or app/<segment>/not-found.jsx)
export default function NotFound() {
  return (
    <main className="container-page py-16">
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <p className="text-gray-600">
        We couldn’t find the page you’re looking for.
      </p>
      <a
        href="/"
        className="inline-block mt-6 rounded-full bg-[#13D4D4] px-6 py-3 text-white font-semibold hover:opacity-90"
      >
        Go Home
      </a>
    </main>
  );
}
// ⚠️ No imports, no "use client", no maps/spreads, no hooks.
// Keep this file totally static.