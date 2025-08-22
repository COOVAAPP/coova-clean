// app/not-found.jsx (server)
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-cyan-500">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="mt-2 max-w-md text-center text-gray-600">
        Sorry, we could not find the page you are looking for.
      </p>
      <a
        href="/"
        className="mt-6 rounded-md bg-cyan-500 px-6 py-3 text-white font-semibold hover:bg-black"
      >
        Go Home
      </a>
    </main>
  );
}