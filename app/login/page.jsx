import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";  // do not prerender /login
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}