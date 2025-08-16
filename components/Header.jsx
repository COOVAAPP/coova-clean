// components/Header.jsx
export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" className="text-2xl font-black tracking-tight text-white">
          COOVA
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/browse" className="text-white/90 hover:text-white">Browse</a>
          <a href="/login" className="text-white/90 hover:text-white">Login</a>
          <a href="/list" className="btn white">List Your Space</a>
        </nav>
      </div>
    </header>
  );
}