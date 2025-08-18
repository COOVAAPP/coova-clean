// app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "COOVA",
  description: "Rent luxury, share vibes.",
  // If you have NEXT_PUBLIC_SITE_URL set, this helps canonical URLs
  // metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://coovaapp.com"),
};

// Keep this simple; strings or objects are fine. Avoid arrays.
export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Client components can be rendered inside a server layout */}
        <Header />

        {/* Page content */}
        <main id="app-root" className="min-h-[calc(100vh-200px)]">
          {children}
        </main>

        <Footer />

        {/* Optional: a portal target for modals if you use them */}
        <div id="modal-root" />
      </body>
    </html>
  );
}