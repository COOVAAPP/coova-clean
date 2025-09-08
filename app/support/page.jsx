export const metadata = {
  title: "Support • COOVA",
  description: "Get help with COOVA.",
};

export default function SupportPage() {
  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-cyan-500">Support</h1>
      <p className="mt-3 text-gray-700">
        Email us at <a className="text-cyan-600 underline" href="mailto:support@coova.app">support@coova.app</a>.
      </p>
      <p className="mt-2 text-gray-700">Common questions and tips coming soon.</p>
    </main>
  );
}