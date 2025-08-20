// app/login/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

/** Force this route to run only on the client (no prerender/SSR) */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/** Load the modal only on the client */
const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-md bg-white px-6 py-4 shadow">Loading…</div>
    </div>
  ),
});

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(true);

  const redirectTo = params.get("redirect") || "/";

  const handleClose = () => {
    setOpen(false);
    router.replace(redirectTo);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  return <AuthModal open={open} onClose={handleClose} />;
}