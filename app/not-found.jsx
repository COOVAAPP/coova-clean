// app/not-found.jsx

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center p-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">404 — Page Not Found</h1>
        <p className="text-gray-500 mb-6">
          Sorry, the page you’re looking for doesn’t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded bg-black text-white px-4 py-2 hover:opacity-90"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}