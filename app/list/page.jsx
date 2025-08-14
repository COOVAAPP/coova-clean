"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient.js";
import UploadBox from "../login/UploadBox.jsx"; // if UploadBox lives elsewhere, adjust path

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // auth gate
  useEffect(() => {
    let done = false;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      if (!done) setReady(true);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (s) setReady(true); });
    check();
    return () => { done = true; sub.subscription?.unsubscribe(); };
  }, [router]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [publicUrl, setPublicUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (!ready) return <div className="shell" style={{padding:"36px 0"}}>Loading…</div>;

  async function createListing(e) {
    e.preventDefault();
    setMsg("");
    if (!title || !price) { setMsg("Please fill all required fields."); return; }
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("listings")
      .insert({
        user_id: session?.user?.id,
        title,
        price: Number(price),
        image_url: publicUrl || null,
        status: "active"
      });

    setSaving(false);
    if (error) { setMsg(error.message); return; }
    setMsg("Listing created!");
    setTitle(""); setPrice(""); setPublicUrl(null);
  }

  return (
    <main className="shell" style={{padding:"28px 0 60px"}}>
      <h1 className="page-title">List Your Space</h1>

      <div className="card form-card">
        <form onSubmit={createListing}>
          <div className="grid">
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                placeholder="Cozy backyard pool"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Price (USD) *</label>
              <input
                className="input"
                type="number"
                placeholder="99"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="row">
            <label className="label">Photo</label>
            <UploadBox onUploaded={(url) => setPublicUrl(url)} />
            {publicUrl ? <p className="help">Uploaded ✓</p> : <p className="help">Upload a cover photo (JPG/PNG).</p>}
          </div>

          {msg && <div className="row" style={{color:"#b91c1c"}}>{msg}</div>}

          <div className="row" style={{display:"flex", gap:10}}>
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Listing"}
            </button>
            <button className="btn" type="button" onClick={() => router.push("/browse")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}