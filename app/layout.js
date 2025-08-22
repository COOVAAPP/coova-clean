// app/layout.jsx
"use client";

import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import "./globals.css";

export const fetchCache = "force-no-store";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}