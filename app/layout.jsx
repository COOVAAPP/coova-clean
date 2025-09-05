// app/layout.jsx
import "./globals.css";
import { Suspense } from "react";
import AuthModal from "@/components/AuthModal";
import AgeGateSync from "@/components/AgeGateSync";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import Agesync from "@/components/AgeSync";

export const fetchCache = "force-no-store";

// (optional) nice to have:
export const metadata = {
  title: "COOVA",
  description: "Discover and host unique spaces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <AgeSync />
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}