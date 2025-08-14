import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="font-extrabold tracking-tight text-slate-900">COOVA</Link>
            <nav className="ml-auto flex items-center gap-2">
              <Link className="btn btn-muted" href="/browse">Browse</Link>
              <Link className="btn btn-muted" href="/login">Login</Link>
              <Link className="btn btn-primary" href="/list">List Your Space</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
