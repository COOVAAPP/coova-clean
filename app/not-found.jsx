// app/not-found.jsx
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "3rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Page Not Found
        </h1>
        <p style={{ color: "#6b7280" }}>
          Sorry, the page you are looking for doesn’t exist.
        </p>
      </div>
    </div>
  );
}