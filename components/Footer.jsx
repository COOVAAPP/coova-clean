import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#13D4D4] text-black">
      <div className="container-page py-8 grid grid-cols-1 sm:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="font-semibold mb-3">COOVA</h3>
          <p className="text-sm">
            Rent luxury spaces, share vibes, and create unforgettable
            experiences.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/browse" className="hover:opacity-80">Browse Listings</Link></li>
            <li><Link href="/login" className="hover:opacity-80">Login</Link></li>
            <li><Link href="/list" className="hover:opacity-80">Sign Up</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:opacity-80">About Us</Link></li>
            <li><Link href="/terms" className="hover:opacity-80">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:opacity-80">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/coova.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <span className="i-simple-icons-instagram h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/coovaapp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <span className="i-simple-icons-twitter h-6 w-6" />
            </a>
            <a
              href="https://tiktok.com/@ycoova.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
            >
              <span className="i-simple-icons-tiktok h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-black/10">
        <div className="container-page py-4 text-xs text-center sm:text-left">
          © {new Date().getFullYear()} COOVA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}