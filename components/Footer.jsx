// components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-cyan-500">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white">COOVA</h3>
            <p className="mt-3 text-sm text-white/80">
              Rent luxury spaces, share vibes. List your pool, car, or creative venue and earn.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-bold text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/browse" className="hover:text-white text-white/90">Browse</Link></li>
              <li><Link href="/browse?type=pools" className="hover:text-white text-white/90">Pools &amp; Venues</Link></li>
              <li><Link href="/browse?type=cars" className="hover:text-white text-white/90">Luxury Cars</Link></li>
              <li><Link href="/browse?type=spaces" className="hover:text-white text-white/90">Unique Spaces</Link></li>
            </ul>
          </div>

          {/* Host */}
          <div>
            <h4 className="text-sm font-bold text-white">Host</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/list" className="hover:text-white text-white/90">List your space</Link></li>
              <li><Link href="/dashboard" className="hover:text-white text-white/90">Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-white text-white/90">Profile</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white text-white/90">About</Link></li>
              <li><Link href="/support" className="hover:text-white text-white/90">Support</Link></li>
              <li><Link href="/contact" className="hover:text-white text-white/90">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-white text-white/90">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-white text-white/90">Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/20 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-white/90">&copy; {year} COOVA. All rights reserved.</p>
            <div className="flex items-center gap-4 text-white/90">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm0 2.2A2.8 2.8 0 1014.8 12 2.8 2.8 0 0012 9.2zM17.5 6a1 1 0 110 2 1 1 0 010-2z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                aria-label="X"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4l4 6 4-6h4l-6.7 9.4L20 20h-4l-4-5.8L8 20H4l6.7-9.4L4 4z"/>
                </svg>
              </a>
              <a
                href="mailto:support@coova.app"
                aria-label="Email"
                className="hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16a2 2 0 012 2v1.2l-10 6.25L2 7.2V6a2 2 0 012-2zm18 5.3V18a2 2 0 01-2 2H4a2 2 0 01-2-2V9.3l10 6.25 10-6.25z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}