import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

export const metadata = {
  title: 'COOVA',
  description: 'Rent Luxury, share vibes.',
};

export const viewport = 'width=device-width, initial-scale=1';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* Header is a Client Component; fine to render here */}
        <Header />

        {/* ✅ Wrap page content in Suspense to satisfy useSearchParams rule */}
        <Suspense fallback={null}>
          <main id="app-root" className="min-h-[calc(100vh-200px)]">
            {children}
          </main>
        </Suspense>

        <Footer />
        <div id="modal-root" />
      </body>
    </html>
  );
}