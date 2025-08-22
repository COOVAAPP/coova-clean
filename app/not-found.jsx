export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-cyan-500">Page Not Found</h1>
      <p className="mt-3 text-gray-600">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <a
        href="/"
        className="mt-6 inline-block rounded-md bg-cyan-500 px-4 py-2 font-bold text-white hover:text-black"
      >
        Go home
      </a>
    </main>
  );
}