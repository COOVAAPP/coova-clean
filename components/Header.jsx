import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container flex items-center gap-4 h-16">
        <Link href="/" className="text-xl font-black text-brand-700">
          COOVA
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link className="btn-outline" href="/browse">Browse</Link>
          <Link className="btn-outline" href="/login">Login</Link>
          <Link className="btn" href="/list">List Your Space</Link>
        </nav>
      </div>
    </header>
  );
}