"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BookingSuccess() {
  const sp = useSearchParams();
  const router = useRouter();
  const bookingId = sp.get("booking_id");

  useEffect(() => {
    // Could poll Supabase for status=paid if you want to confirm live
  }, [bookingId]);

  return (
    <main className="container-page py-16 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Payment Successful 🎉</h1>
      <p className="text-gray-700 mb-6">
        Your booking is confirmed. You’ll receive details by email.
      </p>
      <button className="btn" onClick={() => router.push("/")}>Return Home</button>
    </main>
  );
}