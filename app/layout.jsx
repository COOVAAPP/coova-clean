// app/layout.jsx (SERVER COMPONENT)
// Site-wide SEO metadata lives here.
// UI state and client-only stuff lives in components/ClientShell.jsx

import "./globals.css";
import ClientShell from "@/components/ClientShell";

// Change this to your production origin
const siteUrl = "https://www.coova.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "COOVA",
    template: "%s | COOVA",
  },
  description:
    "Rent luxury spaces, share vibes. List your pool, car, or creative venue and earn on COOVA.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "COOVA",
    title: "COOVA",
    description:
      "Rent luxury spaces, share vibes. List your pool, car, or creative venue and earn on COOVA.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@coova", // optional: set your handle or remove
    title: "COOVA",
    description:
      "Rent luxury spaces, share vibes. List your pool, car, or creative venue and earn on COOVA.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }], // optional if you have it
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" }, // cyan-500
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
};

export default function RootLayout({ children }) {
  // Optional org JSON-LD (kept simple)
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "COOVA",
    url: siteUrl,
    logo: `${siteUrl}/apple-touch-icon.png`,
    sameAs: ["https://instagram.com", "https://twitter.com"],
  };

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}