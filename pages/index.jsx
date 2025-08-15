// pages/index.jsx
import Link from "next/link";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* HERO */}
      <section
        className="relative h-[520px] flex items-center"
        style={{
          backgroundImage:
            "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Rent private spaces,
              <br /> by the hour.
            </h1>
            <p className="mt-4 text-lg text-gray-100">
              Pools, studios, backyards and more—book unique places for your next
              shoot, meetup, party or retreat.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 bg-white rounded-xl shadow-xl p-3 sm:p-4 w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-gray-500 font-semibold mb-1">
                  I want
                </label>
                <select className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <option>Pools</option>
                  <option>Studios</option>
                  <option>Backyards</option>
                  <option>Gyms</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 font-semibold mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter address or city"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs text-gray-500 font-semibold mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Link
                href="/browse"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Find a Space
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-blue-600 font-extrabold text-3xl">1</div>
              <h3 className="mt-3 font-semibold text-gray-900">Browse spaces</h3>
              <p className="mt-2 text-gray-600">
                Discover pools, studios, and unique spaces near you.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-blue-600 font-extrabold text-3xl">2</div>
              <h3 className="mt-3 font-semibold text-gray-900">Book by the hour</h3>
              <p className="mt-2 text-gray-600">
                Simple hourly pricing with instant confirmation.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-blue-600 font-extrabold text-3xl">3</div>
              <h3 className="mt-3 font-semibold text-gray-900">Enjoy your time</h3>
              <p className="mt-2 text-gray-600">
                Host your event, shoot content, or just relax.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular categories
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Pools",
              "Photo Studios",
              "Backyards",
              "Gyms",
              "Kitchens",
              "Lofts",
              "Gardens",
              "Rooftops",
            ].map((label) => (
              <Link
                key={label}
                href="/browse"
                className="h-28 rounded-xl bg-white shadow flex items-center justify-center text-gray-800 font-semibold hover:bg-blue-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOST CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-extrabold">Earn money with your space</h2>
          <p className="mt-3 text-blue-100">
            List your pool, studio, backyard, or unique venue in minutes.
          </p>
          <Link
            href="/list"
            className="inline-flex mt-6 px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50"
          >
            Become a Host
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} COOVA — All rights reserved.
      </footer>
    </div>
  );
}