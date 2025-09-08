export const metadata = {
  title: "Support • COOVA",
  description: "Get help with COOVA. FAQs, safety, reporting, payments, and account support.",
};

export default function SupportPage() {
  return (
    <main className="container-page py-10 prose prose-gray">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Support</h1>
      <p className="mt-2">
        Welcome to COOVA Support. Below are answers to common questions and how to contact us
        if you need more help.
      </p>

      <h2>Contact COOVA</h2>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@coova.app" className="text-cyan-600 underline">
            support@coova.app
          </a>
        </li>
        <li>
          <strong>Response time:</strong> We try to respond within 1–3 business days.
          Urgent safety issues are prioritized.
        </li>
      </ul>

      <h2>Safety & Emergencies</h2>
      <p>
        If anyone is in danger, call your local emergency services immediately. For safety concerns
        related to a booking or listing (non-emergency), email{" "}
        <a href="mailto:support@coova.app" className="text-cyan-600 underline">
          support@coova.app
        </a>{" "}
        with subject line <em>“Safety”</em>. We may request additional details to investigate. COOVA is
        a platform and does not provide insurance or on-site security.
      </p>

      <h2>Report a Problem</h2>
      <ul>
        <li>Listing issues (misrepresentation, unavailable space, photos): email Support with links/screenshots.</li>
        <li>Messaging abuse or harassment: include conversation ID and timestamps.</li>
        <li>Payments or double charges: include booking ID and last four digits of the card (never share full card numbers).</li>
      </ul>

      <h2>Payments, Refunds & Cancellations</h2>
      <p>
        Payments are processed by our third-party provider. Refunds and cancellations are governed by
        the host’s policy and our{" "}
        <a href="/terms" className="text-cyan-600 underline">
          Terms of Service
        </a>
        . If you believe a refund is due, contact Support with your booking ID and a brief summary.
      </p>

      <h2>Account & Login Help</h2>
      <ul>
        <li>Can’t sign in? Try “magic link” or reset your password from the sign-in screen.</li>
        <li>Wrong email on file? Create a new account with the correct email; Support can help migrate data in some cases.</li>
        <li>Want to close your account? Email Support from the account email and request closure.</li>
      </ul>

      <h2>Host Resources</h2>
      <ul>
        <li>Keep listings accurate (pricing, availability, rules). You’re responsible for permits, licenses, and local compliance.</li>
        <li>Add clear house/venue rules in your description and messages.</li>
        <li>We recommend a written agreement for complex shoots/events and verifying insurance when applicable.</li>
      </ul>

      <h2>Content & IP (DMCA)</h2>
      <p>
        If you believe content infringes your intellectual property, email{" "}
        <a href="mailto:support@coova.app" className="text-cyan-600 underline">
          support@coova.app
        </a>{" "}
        with: (a) a description of the work, (b) the URL of the allegedly infringing material,
        (c) your contact info, and (d) a statement that you have a good-faith belief the use is not authorized.
      </p>

      <h2>Data Requests</h2>
      <p>
        To access or delete your personal data, see our{" "}
        <a href="/privacy" className="text-cyan-600 underline">
          Privacy Policy
        </a>{" "}
        and email Support from the account email with your request. Identity verification may be required.
      </p>

      <h2>Policies & Legal</h2>
      <ul>
        <li>
          <a href="/terms" className="text-cyan-600 underline">Terms of Service</a>
        </li>
        <li>
          <a href="/privacy" className="text-cyan-600 underline">Privacy Policy</a>
        </li>
      </ul>

      <h2>Important Disclaimers</h2>
      <p className="text-sm">
        COOVA is a platform that connects hosts and guests. We do not control, endorse, or guarantee
        listings, venue conditions, host qualifications, guest behavior, or compliance with laws. Hosts are
        solely responsible for their listings and compliance; guests are responsible for safe, lawful use of
        the spaces they book. Nothing on this page constitutes legal advice.
      </p>
    </main>
  );
}