// app/layout.js  (Server Component)
import "./globals.css";

import Header from "@/components/Header";    // client component
import Footer from "@/components/Footer";    // client or server — either is fine
import AuthModal from "@/components/AuthModal"; // client component mounted globally

export const metadata = {
  title: "COOVA",
  description: "Rent luxury spaces, share vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Site chrome */}
        <Header />
        {/* Mount the auth modal once at the root so ?auth=1 opens it anywhere */}
        <AuthModal />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}