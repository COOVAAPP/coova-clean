// app/not-found.js
export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-3">404</h1>
        <p className="text-gray-600 mb-6">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <a
          href="/"
          className="inline-block rounded-full bg-brand-600 text-white px-5 py-2 hover:bg-brand-700"
        >
          Go Home
        </a>
      </div>
    </main>
  );
}