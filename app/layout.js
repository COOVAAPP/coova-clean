import Link from "next/link";
import "./globals.css";

export const metadata = { title: "COOVA", description: "Rent private spaces by the hour." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="shell header-row">
            <Link className="brand" href="/">COOVA</Link>
            <nav className="nav">
              <Link className="btn" href="/browse">Browse</Link>
              <Link className="btn" href="/login">Login</Link>
              <Link className="btn primary" href="/list">List Your Space</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}