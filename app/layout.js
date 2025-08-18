// app/layout.js
export const metadata = {
  title: 'COOVA',
  description: 'Rent luxury spaces, cars, and venues',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}