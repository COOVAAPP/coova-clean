// app/messages/page.jsx
export const dynamic = "force-dynamic";

import MessagesClient from "./MessagesClient";

export default function MessagesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-cyan-500">
        Inbox
      </h1>
      <MessagesClient />
    </main>
  );
}