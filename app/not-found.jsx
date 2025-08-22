"use client";

import { Suspense } from "react";
import NotFoundInner from "./NotFoundInner"; // same folder as this file

export default function NotFound() {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <NotFoundInner />
    </Suspense>
  );
}