// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-cyan-500">COOVA</h3>
            <p className="mt-3 text-sm text-gray-600">
              Rent luxury spaces, share vibes. List your pool, car, or creative venue and earn.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-cyan-500">Browse</Link></li>
              <li><Link href="/browse?type=pools" className="hover:text-cyan-500">Pools & Venues</Link></li>
              <li><Link href="/browse?type=cars" className="hover:text-cyan-500">Luxury Cars</Link></li>
              <li><Link href="/browse?type=spaces" className="hover:text-cyan-500">Unique Spaces</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Host</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/list" className="hover:text-cyan-500">List your space</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-500">Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-cyan-500">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-cyan-500">About</Link></li>
              <li><Link href="/support" className="hover:text-cyan-500">Support</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-500">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-cyan-500">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">&copy; {year} COOVA. All rights reserved.</p>
            <div className="flex items-center gap-4 text-gray-500">
              <a href="https://instagram.com" aria-label="Instagram" className="hover:text-cyan-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm0 2.2A2.8 2.8 0 1014.8 12 2.8 2.8 0 0012 9.2zM17.5 6a1 1 0 110 2 1 1 0 010-2z"/></svg>
              </a>
              <a href="https://twitter.com" aria-label="X" className="hover:text-cyan-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4l4 6 4-6h4l-6.7 9.4L20 20h-4l-4-5.8L8 20H4l6.7-9.4L4 4z"/></svg>
              </a>
              <a href="mailto:support@coova.app" aria-label="Email" className="hover:text-cyan-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 012 2v1.2l-10 6.25L2 7.2V6a2 2 0 012-2zm18 5.3V18a2 2 0 01-2 2H4a2 2 0 01-2-2V9.3l10 6.25 10-6.25z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}