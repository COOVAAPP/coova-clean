// app/not-found.jsx
import Link from "next/link";

export const metadata = {
  title: "Page Not Found — COOVA",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Dim background overlay so this feels like a modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          We couldn’t find the page you’re looking for. You can go back home or browse listings.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition"
          >
            Go Home
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200 transition"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </main>
  );
}