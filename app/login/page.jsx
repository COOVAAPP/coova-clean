"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextDynamic from "next/dynamic"; // <-- rename to avoid collision

// Load AuthModal only on the client
const AuthModal = NextDynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

// Make this route always dynamic and avoid pre-render caching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // (or: export const revalidate = 0)

export default function LoginPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <AuthModal
      open={open}
      onClose={() => {
        // close then navigate back to home
        // (avoids a loop if the modal unmounts fast)
        setOpen(false);
        router.push("/");
      }}
    />
  );
}