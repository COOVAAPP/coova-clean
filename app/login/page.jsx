"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// Dynamic client-only modal
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

// Disable prerendering
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
