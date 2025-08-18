// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, the page you’re looking for doesn’t exist or may have been moved.
      </p>

      <Link
        href="/"
        className="inline-block rounded-full bg-[#13D4D4] px-6 py-3 font-semibold text-black hover:opacity-90"
      >
        Go back home
      </Link>
    </div>
  );
}