// app/login/page.jsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <Suspense fallback={<p className="text-gray-600">Loading login…</p>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}