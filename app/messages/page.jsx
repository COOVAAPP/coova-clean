// app/messages/page.jsx
export const dynamic = "force-dynamic";

import InboxList from "@/components/InboxList";
import InboxLite from "./InboxLite";

export default function MessagesPage() {
  return (
    <main className="container-page py-8">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-cyan-500">
        Inbox
      </h1>
      <InboxList />
    </main>
  );
}