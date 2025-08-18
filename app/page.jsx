// app/page.jsx
"use client";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="container-page py-16">
        <h1 className="text-3xl font-bold">COOVA</h1>
        <p className="mt-2 text-gray-700">
          Minimal home to isolate the runtime error.
        </p>
      </section>

      <section className="bg-brand-600 py-12 text-cyan-500">
        <h2 className="text-center text-3xl font-bold">
          Become a Host and Earn with Your Space
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center">
          List your pool, backyard, car, or creative venue space and start generating income today.
        </p>
        <div className="mt-6 text-center">
          <a
            href="/list"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-cyan-500 shadow hover:bg-gray-100"
          >
            Start Hosting
          </a>
        </div>
      </section>
    </main>
  );
}