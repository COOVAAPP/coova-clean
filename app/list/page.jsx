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
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Require auth
  useEffect(() => {
    let stop = false;
    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      if (!stop) setReady(true);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) setReady(true);
    });
    run();
    return () => {
      stop = true;
      sub.subscription?.unsubscribe();
    };
  }, [router]);

  async function createListing(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (!title.trim() || !price || !imageUrl) {
        setMsg("Title, price, and image are required.");
        return;
      }
      setSaving(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setMsg("You must be signed in.");
        return;
      }

      const { error } = await supabase.from("listings").insert([
        {
          user_id: session.user.id,
          title: title.trim(),
          price: Number(price),
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      setMsg("Listing created ✓");
      // Optional: redirect to a browse page
      // router.push("/browse");
    } catch (err) {
      setMsg(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
      <h1>List Your Space</h1>

      <form onSubmit={createListing} style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cozy backyard pool"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Price (USD)</span>
          <input
            className="input"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="99"
          />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <span>Photo</span>
          <UploadBox onUploaded={(url) => setImageUrl(url)} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="preview"
              style={{ marginTop: 8, width: 240, borderRadius: 8 }}
            />
          )}
        </div>

        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Create Listing"}
        </button>

        {msg && <p style={{ color: msg.includes("✓") ? "green" : "crimson" }}>{msg}</p>}
      </form>
    </main>
  );
}