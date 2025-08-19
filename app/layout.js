// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury, share vibes.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
        {/* Header */}
        <Suspense fallback={null}>
          <Header />
        </Suspense>

        {/* Main Content */}
        <main id="app-root" className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Portal Target for Modals */}
        <div id="modal-root" />
      </body>
    </html>
  );
}