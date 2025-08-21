"use client";

import RequireAdult from "@/components/RequireAdult";
import CreateListingClient from "@/components/CreateListingClient";

export const dynamic = "force-dynamic"; // run-time auth/age checks

export default function ListPage() {
  return (
    <RequireAdult>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">
          List your space
        </h1>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <CreateListingClient />
        </div>
      </main>
    </RequireAdult>
  );
}