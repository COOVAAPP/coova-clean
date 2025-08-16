// app/layout.js
import "../styles/globals.css";
import Header from "../components/Header";

export const metadata = {
  title: "COOVA",
  description: "Rent Luxury. Share Vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}