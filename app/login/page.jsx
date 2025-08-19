"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function LoginPage() {
  const router = useRouter();
  const [open] = useState(true);

  return <AuthModal open={open} onClose={() => router.push("/")} />;
}