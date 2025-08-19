"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";

// Dynamic import of the Client-only modal
const AuthModal = dynamicImport(() => import("@/components/AuthModal"), { ssr: false });

// Make sure this page is dynamic and never cached
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// DO NOT export `revalidate` here

export default function LoginPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <AuthModal
      onClose={() => {
        setOpen(false);
        router.push("/");
      }}
    />
  );
}