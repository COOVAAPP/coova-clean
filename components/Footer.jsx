export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1 */}
        <div>
          <h3 className="text-white font-semibold mb-4">COOVA</h3>
          <p className="text-sm">
            Rent luxury spaces, share vibes, and create unforgettable experiences.  
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/list" className="hover:underline">Browse Listings</a></li>
            <li><a href="/login" className="hover:underline">Login</a></li>
            <li><a href="/signup" className="hover:underline">Sign Up</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:underline">About Us</a></li>
            <li><a href="/terms" className="hover:underline">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="https://www.instagram.com/coova.app?igsh=dTdkb2ZhMW0wNWR4&utm_source=qr" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/coovaapp?s=21&t=4zd51WNCyEanaRBnUhO2aA" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://www.tiktok.com/@coova.app?_t=ZP-8ywmwyfZmn9&_r=1" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-10">
        © {new Date().getFullYear()} COOVA. All rights reserved.
      </div>
    </footer>
  )
}