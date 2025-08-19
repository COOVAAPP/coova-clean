"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function LoginPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  retrun (
    <AuthModal open={open} onClose={() => router.push("/")} />
  );
}