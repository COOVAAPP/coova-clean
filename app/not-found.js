// app/not-found.jsx
export default function NotFound() {
  // The simplest safe 404 for prerendering
  return (
    <html lang="en">
      <body>
        <main style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Page not found
          </h1>
          <p style={{ color: '#666' }}>
            The page you’re looking for doesn’t exist or has moved.
          </p>
        </main>
      </body>
    </html>
  );
}