// app/verify-age/page.jsx
import { Suspense } from "react";
import VerifyAgeClient from "./VerifyAgeClient";

export const dynamic = "force-dynamic";  // disable prerender
export const revalidate = 0;

export default function VerifyAgePage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
        Age Verification
      </h1>
      <Suspense fallback={<p className="mt-4 text-gray-600">Loading verify form…</p>}>
        <VerifyAgeClient />
      </Suspense>
    </main>
  );
}