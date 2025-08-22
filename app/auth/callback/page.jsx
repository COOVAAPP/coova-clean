// app/auth/callback/page.jsx
import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <Suspense fallback={<p className="text-gray-600">Signing you in…</p>}>
        <CallbackClient />
      </Suspense>
    </main>
  );
}