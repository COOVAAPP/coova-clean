import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'COOVA',
  description: 'Rent luxury spaces, share vibes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}