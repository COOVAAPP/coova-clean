"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NotFoundInner() {
  const params = useSearchParams();
  const p = params.get("p") || "";

  // Optional: simple “go back” handler
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">
        Page Not Found
      </h1>

      <p className="mt-3 text-gray-600">
        Sorry, the page you’re looking for doesn’t exist{p ? `: “${p}”` : ""}.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          onClick={goBack}
          className="rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50"
        >
          Go back
        </button>
        <Link
          href="/"
          className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-sm font-bold text-white hover:text-black"
        >
          Home
        </Link>
      </div>
    </main>
  );
}