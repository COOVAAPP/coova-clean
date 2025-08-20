// /app/not-found.jsx
export const revalidate = false; // do not pre-render

export default function NotFound() {
  return (
    <main className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-600">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="mt-6 inline-block rounded bg-black px-4 py-2 text-white hover:opacity-90">
        Go Home
      </a>
    </main>
  );
}