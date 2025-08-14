export const metadata = {
  title: 'COOVA',
  description: 'Rent Luxury. Share Vibes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="font-extrabold text-lg">COOVA</a>
            <nav className="ml-auto flex gap-2">
              <a className="px-3 py-1 border rounded" href="/browse">Browse</a>
              <a className="px-3 py-1 border rounded" href="/auth/login">Login</a>
              <a className="px-3 py-1 bg-blue-600 text-white rounded" href="/list">List Your Space</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
