// app/not-found.jsx
export default function NotFound() {
  return (
    <main className="container-page py-16">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
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
// NOTE: no "use client", no imports, no hooks, no maps/spreads