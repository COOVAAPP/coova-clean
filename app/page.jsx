// app/page.jsx
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>COOVA — Health Check</h1>
      <p>Minimal home page to isolate build crash.</p>
    </div>
  );
}