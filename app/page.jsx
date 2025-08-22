/// app/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="mb-8 text-center text-2xl font-bold">Explore Categories</h2>

        <Suspense
          fallback={
            <div className="max-w-6xl mx-auto px-4 py-10">
              <p className="text-gray-600">Loading…</p>
            </div>
          }
        >
          <HomeClient />
        </Suspense>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-12 text-cyan-500">
        <h2 className="text-center text-3xl font-bold">Become a Host and Earn with Your Space</h2>
        <div className="mx-auto mt-3 max-w-2xl text-center">
          <p>List your pool, backyard, car, or creative venue space and start generating income today.</p>
          <div className="mt-6 text-center">
            <a
              href="/list"
              className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-gray-100"
            >
              Start Hosting
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}