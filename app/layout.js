// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury spaces, share vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        {/* Mount the auth modal globally so "Sign in" works anywhere */}
        <AuthModal />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}