"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyAgePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [dob, setDob] = useState("");
  const [attest, setAttest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_of_birth: dob, attest })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setMsg("✅ Age verification complete.");
      // optionally route back to where they came from:
      setTimeout(() => router.push("/profile"), 800);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-cyan-500">Verify your age</h1>
        <p className="mt-4">Please sign in to continue.</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500">Verify your age</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date of birth</label>
          <input
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-cyan-500"
          />
          <p className="text-xs text-gray-500 mt-1">You must be 18 or older to use COOVA.</p>
        </div>

        <label className="flex items-start gap-2">
          <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} />
          <span className="text-sm text-gray-700">
            I attest that the date of birth provided is accurate and I am 18 years of age or older.
          </span>
        </label>

        <button
          disabled={submitting || !dob || !attest}
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-50"
        >
          {submitting ? "Verifying..." : "Verify"}
        </button>

        {msg && (
          <div className="text-sm mt-2">{msg}</div>
        )}
      </form>
    </main>
  );
}