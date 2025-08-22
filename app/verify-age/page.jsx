// app/verify-age/page.jsx
export const dynamic = "force-dynamic";
export const revalidate = 0;                 // must be a number or false
export const fetchCache = "force-no-store";  // keep it uncached

import VerifyAgeClient from "./VerifyAgeClient";

export default function VerifyAgePage({ searchParams }) {
  const next = typeof searchParams?.next === "string" && searchParams.next
    ? searchParams.next
    : "/";

  return <VerifyAgeClient next={next} />;
}