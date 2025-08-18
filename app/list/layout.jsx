// app/list/layout.jsx  (SERVER COMPONENT)
export const dynamic = 'force-dynamic';   // don't pre-render
export const revalidate = 0;               // or a number like 60 for ISR

export default function ListLayout({ children }) {
  return <>{children}</>;
}