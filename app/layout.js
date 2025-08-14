import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Link href="/" style={{ fontWeight: 800, textDecoration: "none" }}>
              COOVA
            </Link>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Link className="btn" href="/browse">
                Browse
              </Link>
              <Link className="btn" href="/login">
                Login
              </Link>
              <Link className="btn primary" href="/list">
                List Your Space
              </Link>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
