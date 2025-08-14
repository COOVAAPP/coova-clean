"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadBox from "./UploadBox";

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let cancel = false;

    async function gate() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      if (!cancel) setReady(true);
    }

    const { data: authSub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });

    gate();
    return () => {
      cancel = true;
      authSub.subscription?.unsubscribe();
    };
  }, [router]);

  async function createListing() {
    setMsg(null);
    try {
      if (!title.trim()) throw new Error("Title is required");
      if (!price || isNaN(Number(price))) throw new Error("Valid price is required");
      if (!imageUrl) throw new Error("Upload a photo first");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be signed in.");
      }

      const { error } = await supabase
        .from("listings")
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          price_cents: Math.round(Number(price) * 100),
          image_url: imageUrl,
          status: "active"
        });

      if (error) throw error;

      setMsg("Listing created!");
      setTitle("");
      setPrice("");
      // keep imageUrl so they can see it
    } catch (e) {
      setMsg(e.message || "Failed to create listing");
    }
  }

  if (!ready) return <div className="container-page">Loading…</div>;

  return (
    <main className="container-page">
      <div className="card">
        <div className="card-body">
          <h1 className="text-xl font-semibold tracking-tight">List Your Space</h1>

          <div>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="Cozy backyard pool"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Price (USD)</label>
            <input
              className="input"
              placeholder="99"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <UploadBox onUploaded={setImageUrl} />

          <div className="divider" />

          <button className="btn btn-primary" onClick={createListing}>
            Create Listing
          </button>

          {msg && <p className="text-sm mt-2 text-slate-700">{msg}</p>}
        </div>
      </div>
    </main>
  );
}