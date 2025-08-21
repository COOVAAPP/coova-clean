// app/components/header.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "./AuthModal";

export default function Header() {
  const pathname = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
 

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gray-900">
          Coova
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/list"
            className={`hover:text-indigo-600 ${
              pathname === "/list" ? "text-indigo-600 font-semibold" : "text-gray-700"
            }`}
          >
            List Your Space
          </Link>

          <Link
            href="/profile"
            className={`hover:text-indigo-600 ${
              pathname === "/profile" ? "text-indigo-600 font-semibold" : "text-gray-700"
            }`}
          >
            Profile
          </Link>

          <Link
            href="/dashboard"
            className={`hover:text-indigo-600 ${
              pathname === "/dashboard" ? "text-indigo-600 font-semibold" : "text-gray-700"
            }`}
          >
            Dashboard
          </Link>

          {/* Auth Buttons */}
          <button
            onClick={() => setAuthOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700"
          >
            Sign In
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-100"
          >
            Sign Out
          </button>
        </nav>
      </div>

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </header>
  );
}