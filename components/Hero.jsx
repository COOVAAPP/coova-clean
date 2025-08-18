// components/Hero.jsx
const IMAGES = [
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg2.jpg",
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg3.jpg",
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[420px] sm:h-[520px]">
        {/* 3 layers that fade in/out via CSS (no JS) */}
        {IMAGES.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center animate-fade ${
              i === 0 ? "animate-delay-0" : i === 1 ? "animate-delay-8s" : "animate-delay-16s"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}

        {/* subtle dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0" />

        {/* content */}
        <div className="relative z-10 container-page py-20 sm:py-28 text-white">
          <h1 className="text-4xl sm:text-5xl font-bold">Rent Luxury. Share Good Vibes.</h1>
          <p className="mt-3 max-w-2xl text-lg">
            Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
          </p>

          {/* Search */}
          <form action="/browse" className="mt-5 grid max-w-2xl grid-cols-12 gap-2 rounded-full bg-white/95 p-2 shadow-lg backdrop-blur">
            <input
              type="text"
              name="q"
              placeholder="I want… (Pools, Cars, Studio)"
              className="col-span-9 rounded-full px-4 py-2 text-[15px] outline-none"
            />
            <button className="col-span-3 rounded-full bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}