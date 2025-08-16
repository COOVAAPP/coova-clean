// app/login/page.jsx
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // avoid static pre-render issues

export default function Page({ searchParams }) {
  const redirect =
    typeof searchParams?.redirect === "string" ? searchParams.redirect : "/list";

  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <LoginClient redirect={redirect} />
    </Suspense>
  );
}