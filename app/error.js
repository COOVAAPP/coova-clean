// app/error.js
'use client';
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="p-8">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">{String(error?.message ?? '')}</p>
        <button className="mt-4 rounded bg-cyan-600 px-3 py-2 text-white" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}