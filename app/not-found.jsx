// app/not-found.jsx
export const revalidate = 0; // disable caching
export const fetchCache = "force-no-store"; // optional but keeps it clean

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">This page could not be found.</p>
      </div>
    </main>
  );
}