import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';

const HERO =
  'https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg';

export default function HomePage() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative w-full">
        <img
          src={HERO}
          alt="Hero"
          className="h-[68vh] w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-page">
            <h1 className="max-w-2xl text-4xl sm:text-5xl font-extrabold text-white drop-shadow">
              Rent Luxury. <span className="text-brand-200">Share Vibes.</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/90">
              Spaces, cars, and venues—book by the hour. Host your event or
              find your next creative location.
            </p>

            <SearchBar />

            <div className="mt-5 flex gap-3">
              <a href="/browse" className="btn btn-primary rounded-full">
                Find a Space
              </a>
              <a href="/list" className="btn btn-outline rounded-full">
                Become a Host
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-12">
        <h2 className="text-2xl font-bold mb-6">Explore categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CategoryCard
            title="Pools & Venues"
            desc="Host birthdays, shoots, and pop-ups."
          />
          <CategoryCard
            title="Luxury Cars"
            desc="Short‑term rentals for special occasions."
          />
          <CategoryCard
            title="Unique Spaces"
            desc="Lofts, rooftops, studios, and more."
          />
        </div>
      </section>
    </>
  );
}