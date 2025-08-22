// app/page.jsx  (SERVER component)

export const dynamic = "force-dynamic";   // you can drop this if you want caching
export const revalidate = 0;              // disable caching for the home page
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto px-4 py-10">
            <p className="text-gray-600">Loading...</p>
          </div>
        }
      >
        <HomeClient />
      </Suspense>
    </main>
  );
}