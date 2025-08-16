// app/page.jsx
import Image from "next/image";

const HERO =
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg";

export default function HomePage() {
  return (
    <main className="bg-white text-slate-900">
      {/* HERO */}
      <section className="relative h-[560px] w-full">
        <Image
          src={HERO}
          alt="COOVA hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold text-white">
              Rent Luxury. Share Vibes.
            </h1>
            <p className="mt-3 text-lg text-white/90">
              Spaces, cars, venues — all in one place.
            </p>

            <div className="mt-6 flex gap-3">
              <a href="/browse" className="btn white">Browse Listings</a>
              <a href="/list" className="btn primary">List your space</a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Explore</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <a href="/browse?type=pools" className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Pools & Venues</h3>
              <p className="mt-1 text-sm text-slate-600">
                Host birthdays, shoots, and pop‑ups.
              </p>
            </div>
          </a>

          <a href="/browse?type=cars" className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Luxury Cars</h3>
              <p className="mt-1 text-sm text-slate-600">
                Short‑term rentals for special occasions.
              </p>
            </div>
          </a>

          <a href="/browse?type=spaces" className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold">Unique Spaces</h3>
              <p className="mt-1 text-sm text-slate-600">
                Lofts, rooftops, studios, and more.
              </p>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}