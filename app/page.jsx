// app/page.jsx
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="container-page py-10 space-y-3">
      <h1 className="text-2xl font-extrabold text-cyan-500">COOVA</h1>
      <p className="text-gray-700">Welcome! Home is rendering.</p>
      <p className="text-sm text-gray-500">Use the “Browse” link to see listings.</p>
    </main>
  );
}