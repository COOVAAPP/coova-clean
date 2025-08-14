"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/list";

  useEffect(() => {
    // No-op. Page renders button.
  }, [redirect]);

  const onClick = async () => {
    await signIn("google", { callbackUrl: redirect });
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={onClick}
      >
        Sign in with Google
      </button>
    </div>
  );
}