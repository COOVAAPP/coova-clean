export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/70 border-b border-gray-100">
      <div className="container-page h-16 flex items-center justify-between">
        <a href="/" className="text-2xl font-black tracking-tight">
          COOVA
        </a>

        <nav className="hidden md:flex items-center gap-6 text-[15px]">
          <a href="/browse">Browse</a>
          <a href="/login">Login</a>
          <a href="/list" className="btn btn-primary">List Your Space</a>
        </nav>

        <a href="/list" className="md:hidden btn btn-primary">List</a>
      </div>
    </header>
  );
}