"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen grid place-items-center p-6">
        <div className="max-w-lg w-full space-y-3">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-gray-600">
            {process.env.NODE_ENV !== "production"
              ? String(error?.message || error)
              : "Please try again."}
          </p>
          <button
            onClick={() => reset()}
            className="rounded bg-cyan-600 px-3 py-1.5 text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}