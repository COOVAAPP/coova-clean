"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#9EFCFF]/90 backdrop-blur">
      <div className="container-page h-16 flex items-center justify-between">
        <Link href="/" className="text-5xl font-bold text-white tracking-wide">COOVA</Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/browse" className="hover:opacity-80">Browse</Link>
          <Link href="/login" className="hover:opacity-80">Login</Link>
          <Link
            href="/list"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            List Your Space
          </Link>
        </nav>
      </div>
    </header>
  );
}