import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section with Rotating Background + Search */}
      <Hero />

      {/* Category Cards */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
          Explore Categories
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {/* Pools & Venues */}
          <div className="group relative h-56 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
            <img
              src="https://source.unsplash.com/600x400/?pool,party"
              alt="Pools & Venues"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                Pools & Venues
              </span>
            </div>
          </div>

          {/* Luxury Cars */}
          <div className="group relative h-56 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
            <img
              src="https://source.unsplash.com/600x400/?luxury,car"
              alt="Luxury Cars"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                Luxury Cars
              </span>
            </div>
          </div>

          {/* Unique Spaces */}
          <div className="group relative h-56 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
            <img
              src="https://source.unsplash.com/600x400/?studio,loft"
              alt="Unique Spaces"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">
                Unique Spaces
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-600 py-12 text-white text-center">
        <h2 className="text-3xl font-bold">
          Become a Host and Earn with Your Space
        </h2>
        <p className="mt-3 max-w-2xl mx-auto">
          List your pool, car, or creative venue and start generating income today.
        </p>
        <a
          href="/host"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-600 shadow hover:bg-gray-100"
        >
          Start Hosting
        </a>
      </section>
    </main>
  );
}
