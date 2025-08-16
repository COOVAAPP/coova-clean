// app/page.jsx
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section
          className="relative isolate overflow-hidden bg-slate-900"
          style={{
            backgroundImage:
              "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-black/50">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                  Rent Luxury. Share Vibes.
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-200">
                  Spaces, cars, venues — all in one place.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a href="/browse" className="btn bg-brand-500 hover:bg-brand-600">
                    Browse Listings
                  </a>
                  <a
                    href="/list"
                    className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-white hover:bg-white/10"
                  >
                    List Your Space
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="card p-6">
              <h3 className="text-lg font-semibold">Pools & Venues</h3>
              <p className="mt-2 text-sm text-slate-600">
                Host birthdays, shoots, and pop-ups.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold">Luxury Cars</h3>
              <p className="mt-2 text-sm text-slate-600">
                Short-term rentals for special occasions.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold">Unique Spaces</h3>
              <p className="mt-2 text-sm text-slate-600">
                Lofts, rooftops, studios, and more.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}