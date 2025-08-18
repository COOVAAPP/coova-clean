// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page py-16">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-600">
        The page you requested could not be found.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2 text-white hover:bg-brand-700"
      >
        Go Home
      </Link>
    </main>
  );
}