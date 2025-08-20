// app/not-found.jsx
// FULL FILE — copy & paste

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "3rem",
          background: "#f7fafc",
          color: "#111827",
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Page Not Found
          </h1>
          <p style={{ color: "#6b7280" }}>
            Sorry, the page you’re looking for doesn’t exist.
          </p>
        </div>
      </body>
    </html>
  );
}