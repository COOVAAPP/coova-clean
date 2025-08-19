// app/verify-sms/page.jsx  (SERVER FILE - no "use client")
export const dynamic = "force-dynamic";      // always dynamic
export const fetchCache = "force-no-store";  // do not cache
export const revalidate = 0;                 // never ISR

import VerifySmsClient from "./VerifySmsClient";

export default function VerifySmsPage() {
  return <VerifySmsClient />;
}