// app/list/create/page.jsx
"use client";

import CreateListingClient from "@/components/CreateListingClient";

export default function CreateListingPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
        Create a new listing
      </h1>
      <div className="mt-6">
        <CreateListingClient />
      </div>
    </main>
  );
}