// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury, share vibes.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Header can be client; wrap in Suspense to satisfy Next warnings */}
        <Suspense fallback={null}>
          <Header />
        </Suspense>

        {/* Wrap the route tree (children) in Suspense */}
        <Suspense fallback={<div className="container-page py-10">Loading…</div>}>
          <main id="app-root">{children}</main>
        </Suspense>

        <Footer />
        {/* Optional portal mount point for modals */}
        <div id="modal-root" />
      </body>
    </html>
  );
}