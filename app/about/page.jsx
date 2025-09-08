export const metadata = {
  title: "About • COOVA",
  description: "Learn about COOVA — our mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <main className="container-page py-10 prose prose-gray">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">
        About COOVA
      </h1>

      <p className="mt-2">
        COOVA is a platform that connects people with unique spaces and
        experiences. From pools and creative studios to luxury cars and
        event-ready venues, our goal is to make it easy to share what you
        already have — and discover what others are offering.
      </p>

      <h2>Our Mission</h2>
      <p>
        To empower individuals to unlock the value of their spaces, cars, and
        venues while giving guests access to unforgettable experiences.
      </p>

      <h2>Our Values</h2>
      <ul>
        <li>
          <strong>Trust & Safety:</strong> We’re committed to keeping
          interactions respectful and secure. Age verification, profile
          protections, and reporting tools are core parts of our platform.
        </li>
        <li>
          <strong>Community:</strong> COOVA is about people. Hosts and guests
          bring our platform to life by sharing spaces and creating memories.
        </li>
        <li>
          <strong>Accessibility:</strong> We strive to keep our platform easy to
          use, affordable, and open to diverse communities.
        </li>
        <li>
          <strong>Accountability:</strong> Hosts remain responsible for their
          listings and compliance with local laws; guests are expected to use
          spaces responsibly and safely.
        </li>
      </ul>

      <h2>What Makes COOVA Different?</h2>
      <p>
        Unlike traditional rental platforms, COOVA is built to cover multiple
        categories — pools, luxury cars, unique venues, and more — all in one
        place. We focus on simplicity, transparency, and community-driven
        growth.
      </p>

      <h2>Looking Ahead</h2>
      <p>
        We’re constantly improving COOVA based on feedback from our community.
        New features, stronger safety tools, and better ways to connect are
        always in progress.
      </p>

      <h2>Get Involved</h2>
      <ul>
        <li>
          Have a space, car, or venue?{" "}
          <a href="/list/create" className="text-cyan-600 underline">
            List it today
          </a>{" "}
          and start earning.
        </li>
        <li>
          Want to book?{" "}
          <a href="/browse" className="text-cyan-600 underline">
            Browse spaces
          </a>{" "}
          and explore what’s nearby.
        </li>
        <li>
          Questions?{" "}
          <a href="/support" className="text-cyan-600 underline">
            Visit Support
          </a>{" "}
          or email{" "}
          <a href="mailto:support@coova.app" className="text-cyan-600 underline">
            support@coova.app
          </a>
          .
        </li>
      </ul>

      <h2>Legal & Policies</h2>
      <ul>
        <li>
          <a href="/terms" className="text-cyan-600 underline">
            Terms of Service
          </a>
        </li>
        <li>
          <a href="/privacy" className="text-cyan-600 underline">
            Privacy Policy
          </a>
        </li>
        <li>
          <a href="/support" className="text-cyan-600 underline">
            Support
          </a>
        </li>
      </ul>

      <p className="mt-6 text-sm text-gray-500">
        COOVA is not a party to host–guest agreements. We provide the platform
        only. Hosts are responsible for compliance with laws and regulations,
        and guests are responsible for lawful, safe use of booked spaces.
      </p>
    </main>
  );
}