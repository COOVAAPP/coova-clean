export const metadata = {
  title: "Terms of Service • COOVA",
  description: "COOVA Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="container-page py-10 prose prose-gray">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Terms of Service</h1>
      <p className="mt-3">Effective Date: {new Date().getFullYear()}</p>

      <p>
        These Terms of Service (“Terms”) constitute a legally binding agreement between you
        (“user,” “you,” or “your”) and <strong>COOVA</strong> (“Company,” “we,” “our,” or “us”)
        governing your access to and use of our platform, website, mobile applications, and related
        services (collectively, the “Services”).
      </p>

      <h2>1. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years of age to use the Services.</li>
        <li>By creating an account, you represent and warrant that you meet this age requirement and that all information you provide is truthful and accurate.</li>
      </ul>

      <h2>2. Accounts</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
        <li>You agree to notify us immediately of any unauthorized access or use of your account.</li>
      </ul>

      <h2>3. User Responsibilities</h2>
      <p>When using the Services, you agree not to:</p>
      <ul>
        <li>Violate any applicable local, state, national, or international law.</li>
        <li>Post, upload, or transmit any unlawful, fraudulent, or infringing content.</li>
        <li>Use the Services to facilitate illegal activities, including unlicensed rentals or events.</li>
        <li>Interfere with the proper operation or security of the platform.</li>
      </ul>

      <h2>4. Hosting and Bookings</h2>
      <ul>
        <li>Hosts are solely responsible for ensuring that their property, pool, vehicle, or venue complies with applicable safety standards, permits, and legal requirements.</li>
        <li>COOVA does not verify the accuracy of listings or guarantee availability.</li>
        <li>Guests are responsible for reviewing and complying with all booking terms, fees, and rules provided by hosts.</li>
      </ul>

      <h2>5. Payments</h2>
      <ul>
        <li>Payments are processed by third-party payment providers. By using the Services, you agree to comply with their terms and conditions.</li>
        <li>COOVA is not responsible for errors, delays, or disputes arising from payment processors.</li>
        <li>All bookings are subject to applicable service fees, taxes, and cancellation policies.</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        All content, branding, software, and intellectual property associated with the Services are
        owned by or licensed to COOVA. You may not copy, distribute, or create derivative works
        without our prior written consent.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, COOVA is not liable for indirect, incidental,
        consequential, or punitive damages, including loss of profits, data, goodwill, or business
        opportunities. COOVA’s total liability for any claim shall not exceed the amount paid by you
        for the Services in the six (6) months preceding the claim.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless COOVA, its officers, employees, and
        affiliates from any claims, damages, liabilities, costs, or expenses (including attorneys’
        fees) arising out of or related to your use of the Services, your listings, or your violation of
        these Terms.
      </p>

      <h2>9. Termination</h2>
      <ul>
        <li>We may suspend or terminate your account at our discretion if you violate these Terms or engage in unlawful conduct.</li>
        <li>You may stop using the Services at any time by closing your account.</li>
      </ul>

      <h2>10. Governing Law and Dispute Resolution</h2>
      <ul>
        <li>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict-of-law provisions.</li>
        <li>Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association (AAA). You waive your right to participate in class actions.</li>
      </ul>

      <h2>11. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Changes will be effective upon
        posting on the Services with a revised “Effective Date.” Continued use of the Services after
        such modifications constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        For questions regarding these Terms, please contact us at{" "}
        <a href="mailto:support@coova.app" className="text-cyan-600 underline">
          support@coova.app
        </a>.
      </p>
    </main>
  );
}