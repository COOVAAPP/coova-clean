// components/SafeHero.jsx
"use client";
export default function SafeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="h-[420px] bg-center bg-cover"
        style={{ backgroundImage: "url('https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/bg1.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/0" />
      <div className="absolute inset-0 flex items-center">
        <div className="container-page">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Rent Luxury. Share Good Vibes.
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Spaces, cars, and venues—book by the hour. Host your event or find your next creative location.
          </p>
        </div>
      </div>
    </section>
  );
}