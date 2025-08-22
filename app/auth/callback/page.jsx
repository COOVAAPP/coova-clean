"use client";

import { Suspense } from "react";
import AuthCallback from "./AuthCallback";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Finishing sign-in…</p>}>
      <AuthCallback />
    </Suspense>
  );
}