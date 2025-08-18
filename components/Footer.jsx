"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#13D4D4] text-black">
      <div className="container-page py-10 grid grid-cols-1 sm:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-3">COOVA</h3>
          <p className="text-sm">Rent luxury spaces, share vibes.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/browse" className="hover:opacity-80">Browse</Link></li>
            <li><Link href="/login" className="hover:opacity-80">Login</Link></li>
            <li><Link href="/list" className="hover:opacity-80">Sign Up</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:opacity-80">About</Link></li>
            <li><Link href="/terms" className="hover:opacity-80">Terms</Link></li>
            <li><Link href="/privacy" className="hover:opacity-80">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4 text-sm">
            <a href="https://instagram.com/coova.app" target="_blank" rel="noreferrer" className="hover:opacity-80">Instagram</a>
            <a href="https://twitter.com/coovaapp"  target="_blank" rel="noreferrer" className="hover:opacity-80">X</a>
            <a href="https://tiktok.com/@coova.app" target="_blank" rel="noreferrer" className="hover:opacity-80">TikTok</a>
          </div>
        </div>
      </div>

      <div className="border-t border-black/15">
        <div className="container-page py-4 text-xs">
          © {new Date().getFullYear()} COOVA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}