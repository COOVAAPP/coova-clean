// app/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Load modal on the client only
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

// Force dynamic at the route level, but DO NOT export `revalidate` here
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // avoid any pre-render cache

export default function LoginPage() {
  const router = useRouter();
  const [open] = useState(true);
  return <AuthModal open={open} onClose={() => router.push("/")} />;
}