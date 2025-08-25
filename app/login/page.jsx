// app/login/page.jsx  (SERVER component wrapper – tiny and safe)
import { Suspense } from "react";
import LoginClient from "./LoginClient"; // <- this is your existing login code

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
            <p className="text-gray-600">Loading login…</p>
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </main>
  );
}