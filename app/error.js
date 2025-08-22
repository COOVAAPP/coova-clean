"use client";

export default function Error({ error, reset }) {
  console.error("[verify-age] route error:", error);
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        We couldn’t load the age verification step.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-600"
      >
        Try again
      </button>
    </main>
  );
}