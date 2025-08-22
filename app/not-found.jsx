// app/not-found.jsx  (server component – no "use client")
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-cyan-500">
        Page Not Found
      </h1>
      <p className="mt-4 text-gray-600">
        Sorry, the page you’re looking for doesn’t exist.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-cyan-500 px-4 py-2 text-white font-bold hover:text-black"
        >
          Go home
        </Link>
        <Link
          href="/browse"
          className="rounded-md border px-4 py-2 font-bold hover:bg-gray-50"
        >
          Browse
        </Link>
      </div>
    </main>
  );
}