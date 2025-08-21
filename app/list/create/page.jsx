// app/layout.js
import "./globals.css";
import Header from "@/components/Header";       // client component
import Footer from "@/components/Footer";       // (client or server—either is fine)
import AuthModal from "@/components/AuthModal"; // client component that watches ?auth=1

export const metadata = {
  title: "COOVA",
  description: "Rent luxury spaces, share vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        {/* Mount globally so clicking “Sign in” (which sets ?auth=1) opens this anywhere */}
        <AuthModal />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}