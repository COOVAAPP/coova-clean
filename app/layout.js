// app/layout.js
import '../styles/globals.css';            // <— load Tailwind here
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury spaces, share vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main className="container-page">{children}</main>
        <Footer />
      </body>
    </html>
  );
}