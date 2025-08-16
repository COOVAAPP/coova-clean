import '../styles/globals.css'
import Header from '@/components/Header'

export const metadata = {
  title: 'COOVA',
  description: 'Rent Luxury. Share Vibes.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  )
}