// app/login/page.jsx  (SERVER COMPONENT)
import AuthModal from "@/components/AuthModal"; // this is a client component

export const dynamic = "force-dynamic"; // valid because this file is server-side

export default function LoginPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      {/* If your AuthModal normally opens via ?auth=1, you can pass a prop to force it open */}
      <AuthModal standalone />
    </main>
  );
}