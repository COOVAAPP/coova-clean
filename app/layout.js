// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <main id="app-root" className="min-h-[calc(100vh-200px)]">
          <Header />
          {children}
          <Footer />
        </main>
        <div id="modal-root" />
      </body>
    </html>
  );
}