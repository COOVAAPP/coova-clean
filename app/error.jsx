// app/error.jsx
'use client';

export default function GlobalError({ error, reset }) {
  return (
    <main className="container-page py-16">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <pre className="bg-gray-100 p-4 rounded text-xs whitespace-pre-wrap">
        {String(error?.message || error)}
      </pre>
      <button
        onClick={() => reset()}
        className="mt-4 rounded bg-black text-white px-4 py-2"
      >
        Try again
      </button>
    </main>
  );
}