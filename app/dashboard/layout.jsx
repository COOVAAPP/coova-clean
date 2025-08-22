// /app/dashboard/layout.jsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}