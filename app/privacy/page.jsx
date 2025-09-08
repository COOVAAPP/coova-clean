export const metadata = {
  title: "Privacy Policy • COOVA",
  description: "COOVA Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="container-page py-10 prose prose-gray text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Privacy Policy</h1>
      <p className="mt-3">Effective Date: {new Date().getFullYear()}</p>

      <p>
        This Privacy Policy (“Policy”) describes how <strong>COOVA</strong> (“Company,” “we,” “our,” 
        or “us”) collects, uses, discloses, and safeguards information from users (“you,” “your”) 
        who access or use our platform, website, applications, and services (collectively, the 
        “Services”). By accessing or using the Services, you consent to the practices described in 
        this Policy.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li><strong>Personal Identifiers:</strong> name, email address, phone number, profile details.</li>
        <li><strong>Account and Authentication Data:</strong> login credentials, session tokens, and age verification confirmations.</li>
        <li><strong>Transaction Data:</strong> bookings, reservations, payment details, billing addresses.</li>
        <li><strong>Location Data:</strong> addresses of properties, vehicles, or venues listed by users.</li>
        <li><strong>Usage Information:</strong> device data, IP address, browser type, access logs, and interactions with the Services.</li>
        <li><strong>Communications:</strong> messages exchanged between hosts and guests, customer support inquiries.</li>
      </ul>

      <h2>2. Purpose of Collection and Use of Information</h2>
      <p>Your information may be used for the following lawful purposes:</p>
      <ul>
        <li>To provide, operate, and improve the Services.</li>
        <li>To verify age and eligibility (18+ requirement).</li>
        <li>To facilitate reservations, payments, and host–guest communications.</li>
        <li>To enforce our Terms of Service, prevent fraud, and ensure platform security.</li>
        <li>To comply with applicable legal, regulatory, or law enforcement requirements.</li>
        <li>To send administrative notifications, confirmations, and support communications.</li>
        <li>For analytics, research, and service optimization.</li>
      </ul>

      <h2>3. Disclosure of Information</h2>
      <p>We do not sell personal information. We may disclose information as follows:</p>
      <ul>
        <li>To service providers (e.g., payment processors, identity verification partners, hosting providers).</li>
        <li>To comply with subpoenas, court orders, or other legal obligations.</li>
        <li>In connection with a merger, acquisition, financing, or sale of assets, subject to confidentiality protections.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain personal information only for as long as necessary to fulfill the purposes set out 
        in this Policy, unless a longer retention period is required by law.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement reasonable administrative, technical, and physical safeguards designed to 
        protect personal information. However, no method of transmission over the internet or method 
        of storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>6. Your Rights</h2>
      <p>Depending on your jurisdiction (including the European Union, California, or others), you may have the right to:</p>
      <ul>
        <li>Request access to the personal information we hold about you.</li>
        <li>Request correction, deletion, or restriction of processing.</li>
        <li>Opt out of certain communications or data uses.</li>
        <li>Request data portability.</li>
      </ul>
      <p>
        To exercise these rights, contact us at{" "}
        <a href="mailto:support@coova.app" className="text-cyan-600 underline">
          support@coova.app
        </a>. We will verify your identity before processing requests as required by law.
      </p>

      <h2>7. Children’s Privacy</h2>
      <p>
        The Services are not directed to, and we do not knowingly collect personal information 
        from, individuals under the age of 18. If we become aware that we have inadvertently 
        collected such information, we will delete it promptly.
      </p>

      <h2>8. International Users</h2>
      <p>
        If you access the Services from outside the United States, you acknowledge and agree that 
        your information may be transferred to, processed, and stored in the United States, which 
        may have different data protection laws than your country of residence.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        We reserve the right to update or modify this Policy at any time. Updates will be effective 
        upon posting to the Services with a revised “Effective Date.” We encourage you to review 
        this Policy periodically.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        For questions or concerns regarding this Policy, please contact us at:{" "}
        <a href="mailto:support@coova.app" className="text-cyan-600 underline">
          support@coova.app
        </a>.
      </p>
    </main>
  );
}