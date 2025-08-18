// app/layout.js
import "./globals.css";
import Header from "../components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "COOVA⌣",
  description: "Rent luxury spaces, cars, and venues — by the hour",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="min-h-screen text-gray-900 antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}