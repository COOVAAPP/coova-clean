// app/not-found.jsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto flex-1 px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-cyan-500">404</h1>
        <p className="mt-2 text-xl font-semibold text-gray-900">This page could not be found.</p>
        <p className="mt-4 text-gray-600">
          The link might be broken, or the page may have been removed.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-cyan-500 px-5 py-2.5 text-white font-semibold hover:bg-cyan-600"
          >
            Go home
          </Link>
          <Link
            href="/browse"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-gray-800 hover:bg-gray-50"
          >
            Browse listings
          </Link>
        </div>
      </div>

      {/* Optional footer strip to match brand */}
      <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} COOVA. All rights reserved.
      </div>
    </main>
  );
}