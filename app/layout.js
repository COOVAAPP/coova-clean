// app/layout.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "COOVA",
  description:
    "Rent luxury spaces, cars, and venues—book by the hour. Host your event or find your next creative location.",
  // Keep metadata minimal – don’t put arrays with numbers, etc.
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-50 text-gray-900">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}