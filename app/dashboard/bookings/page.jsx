"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 20;
const allowedStatuses = ["pending", "accepted", "declined", "canceled"];

function Badge({ status }) {
  const cls =
    status === "accepted"
      ? "bg-green-100 text-green-700"
      : status === "declined"
      ? "bg-rose-100 text-rose-700"
      : status === "canceled"
      ? "bg-zinc-100 text-zinc-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function Money({ cents }) {
  const dollars = (cents ?? 0) / 100;
  return <span>${dollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>;
}

export default function BookingsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("host"); // 'host' | 'guest'
  const [loading, setLoading] = useState(false);

  const [hostRows, setHostRows] = useState([]);
  const [guestRows, setGuestRows] = useState([]);

  const [hostPage, setHostPage] = useState(0);
  const [guestPage, setGuestPage] = useState(0);
  const [hostCount, setHostCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);

  // ------- session gate -------
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.replace("/login");
      } else {
        setSession(data.session);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  // ------- fetchers -------
  async function fetchHost(page = 0) {
    if (!session?.user) return;
    setLoading(true);

    // Bookings for listings I own (host)
    // Uses foreign-table filter: listing.owner_id = my id
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        start_at,
        end_at,
        guests,
        total_cents,
        created_at,
        listing:listing_id (
          id,
          title,
          owner_id,
          image_url,
        ),
        guest:guest_id (
          id,
          email
        )
      `,
        { count: "exact" }
      )
      .eq("listing.owner_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      setHostRows([]);
      setHostCount(0);
    } else {
      setHostRows(data || []);
      setHostCount(count || 0);
    }

    setLoading(false);
  }

  async function fetchGuest(page = 0) {
    if (!session?.user) return;
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // My own bookings (guest)
    const { data, count, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        start_at,
        end_at,
        guests,
        total_cents,
        created_at,
        listing:listing_id (
          id,
          title,
          owner_id,
          image_url,
        )
      `,
        { count: "exact" }
      )
      .eq("guest_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
      setGuestRows([]);
      setGuestCount(0);
    } else {
      setGuestRows(data || []);
      setGuestCount(count || 0);
    }

    setLoading(false);
  }

  // initial + on tab/page change
  useEffect(() => {
    if (!ready) return;
    if (tab === "host") fetchHost(hostPage);
    if (tab === "guest") fetchGuest(guestPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tab, hostPage, guestPage]);

  // ------- mutations -------
  async function updateStatus(id, next) {
    if (!allowedStatuses.includes(next)) return;
    const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id);
    if (error) {
      alert(`Update failed: ${error.message}`);
      return;
    }
    // refresh the active tab
    if (tab === "host") fetchHost(hostPage);
    else fetchGuest(guestPage);
  }

  function Paginator({ page, setPage, total }) {
    const pages = Math.ceil((total || 0) / PAGE_SIZE);
    return (
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page <= 0}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {pages === 0 ? 0 : page + 1} / {pages}
        </span>
        <button
          onClick={() => setPage(Math.min(pages - 1, page + 1))}
          disabled={pages === 0 || page >= pages - 1}
          className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }

  function Row({ row, isHostView }) {
    const start = new Date(row.start_at);
    const end = new Date(row.end_at);
    const range = `${start.toLocaleString()} → ${end.toLocaleString()}`;
    const title = row?.listing?.title ?? "Listing";

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold truncate">{title}</h3>
            <Badge status={row.status} />
          </div>
          <p className="text-sm text-gray-600 mt-1">{range}</p>
          <p className="text-sm text-gray-600">Guests: {row.guests}</p>
          <p className="text-sm text-gray-900 font-medium mt-1">
            Total: <Money cents={row.total_cents} />
          </p>
          {isHostView && (
            <p className="text-xs text-gray-500 mt-1">
              Guest: <span className="font-medium">{row?.guest?.email ?? "—"}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isHostView ? (
            <>
              <button
                onClick={() => updateStatus(row.id, "accepted")}
                disabled={row.status === "accepted"}
                className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus(row.id, "declined")}
                disabled={row.status === "declined"}
                className="px-3 py-1.5 rounded bg-rose-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => updateStatus(row.id, "canceled")}
                disabled={row.status === "canceled"}
                className="px-3 py-1.5 rounded border text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => updateStatus(row.id, "canceled")}
                disabled={row.status === "canceled"}
                className="px-3 py-1.5 rounded border text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const hostEmpty = useMemo(() => ready && tab === "host" && hostRows.length === 0, [ready, tab, hostRows]);
  const guestEmpty = useMemo(() => ready && tab === "guest" && guestRows.length === 0, [ready, tab, guestRows]);

  if (!ready) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Bookings</h1>

      {/* Tabs */}
      <div className="mt-6 inline-flex rounded-lg border bg-white overflow-hidden">
        <button
          onClick={() => setTab("host")}
          className={`px-4 py-2 text-sm font-semibold ${
            tab === "host" ? "bg-cyan-500 text-white" : "hover:bg-gray-50"
          }`}
        >
          As Host
        </button>
        <button
          onClick={() => setTab("guest")}
          className={`px-4 py-2 text-sm font-semibold ${
            tab === "guest" ? "bg-cyan-500 text-white" : "hover:bg-gray-50"
          }`}
        >
          As Guest
        </button>
      </div>

      {/* Lists */}
      <div className="mt-6 space-y-3">
        {tab === "host" && (
          <>
            {loading && <p className="text-sm text-gray-500">Loading…</p>}
            {!loading && hostEmpty && <p className="text-sm text-gray-500">No bookings yet.</p>}
            {!loading &&
              hostRows.map((b) => <Row key={b.id} row={b} isHostView={true} />)}
            <Paginator page={hostPage} setPage={setHostPage} total={hostCount} />
          </>
        )}

        {tab === "guest" && (
          <>
            {loading && <p className="text-sm text-gray-500">Loading…</p>}
            {!loading && guestEmpty && <p className="text-sm text-gray-500">You haven’t booked anything yet.</p>}
            {!loading &&
              guestRows.map((b) => <Row key={b.id} row={b} isHostView={false} />)}
            <Paginator page={guestPage} setPage={setGuestPage} total={guestCount} />
          </>
        )}
      </div>
    </main>
  );
}