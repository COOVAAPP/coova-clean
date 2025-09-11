// app/contact/page.jsx
import Link from "next/link";

// ── EDIT THIS to your real production origin ────────────────────────────────
const siteUrl = "https://www.coova.app";
// ────────────────────────────────────────────────────────────────────────────

export const dynamic = "force-static";
export const revalidate = false;

export const metadata = {
  title: "Contact | COOVA",
  description:
    "Questions, feedback, or partnership inquiries? Contact COOVA by email and we’ll get back to you.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/contact`,
    title: "Contact COOVA",
    description:
      "Questions, feedback, or partnership inquiries? Contact COOVA by email.",
    siteName: "COOVA",
  },
  twitter: {
    card: "summary",
    title: "Contact COOVA",
    description:
      "Questions, feedback, or partnership inquiries? Contact COOVA by email.",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Contact",
        item: `${siteUrl}/contact`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container-page py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-cyan-600">
            Contact COOVA
          </h1>
          <p className="mt-3 text-gray-600">
            We’d love to hear from you. For support, partnerships, or media
            inquiries, email us and we’ll respond as soon as possible.
          </p>

          <div className="mt-8">
            <a
              href="mailto:support@coova.app"
              className="inline-flex items-center rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
            >
              Email support@coova.app
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Prefer self-serve? Check our{" "}
            <Link href="/support" className="text-cyan-600 hover:underline">
              Support
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-cyan-600 hover:underline">
              Privacy
            </Link>{" "}
            pages.
          </p>
        </div>
      </main>
    </>
  );
}