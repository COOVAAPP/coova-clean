'use client';

export default function SearchBar() {
  return (
    <form
      className="w-full max-w-3xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/90 p-2 rounded-full shadow-lg"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="input rounded-full"
        placeholder="I want… (Pools, Cars, Studios)"
        aria-label="Category"
      />
      <input
        className="input rounded-full"
        placeholder="Location"
        aria-label="Location"
      />
      <button type="submit" className="btn btn-primary rounded-full">
        Search
      </button>
    </form>
  );
}