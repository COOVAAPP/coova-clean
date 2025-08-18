// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury spaces, cars, and venues — share vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="min-h-screen text-gray-900 antialiased flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF] supports-[backdrop-filter]:bg-[#9EFCFF]/90 backdrop-blur">
          <div className="container-page py-3">
            <Header />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Footer (always rendered) */}
        <Footer />
      </body>
    </html>
  );
}