// app/layout.js
import '../styles/globals.css';

export const metadata = {
  title: 'COOVA',
  description: 'Rent Luxury. Share Vibes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">{children}</body>
    </html>
  );
}