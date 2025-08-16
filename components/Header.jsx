// components/Header.jsx
export default function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-black text-xl tracking-tight">
          COOVA
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="/browse" className="hover:text-brand-600">Browse</a>
          <a href="/login" className="hover:text-brand-600">Login</a>
          <a href="/list" className="btn">List Your Space</a>
        </nav>
      </div>
    </header>
  );
}