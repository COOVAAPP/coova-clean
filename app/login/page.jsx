"use client";

import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

export default function LoginPage() {
  const [open, setOpen] = useState(false);

  // Open automatically when visiting /login
  useEffect(() => {
    setOpen(true);
  }, []);

  function handleClose() {
    setOpen(false);
    // Redirect home after login or close
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* AuthModal portal */}
      <AuthModal open={open} onClose={handleClose} />

      {/* Optional fallback content if modal fails */}
      {!open && (
        <p className="text-gray-500">
          If the login modal didn’t open,{" "}
          <button
            onClick={() => setOpen(true)}
            className="text-brand-600 hover:underline"
          >
            click here
          </button>
          .
        </p>
      )}
    </div>
  );
}