// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-cyan-500">
          Page Not Found
        </h1>
        <p className="mt-4 text-gray-600">
          Sorry, the page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-md bg-cyan-500 px-5 py-2 font-semibold text-white hover:bg-cyan-600"
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}