"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UploadBox from "./UploadBox.jsx";

const HERO =
  "https://opnqqloemtaaowfttafs.supabase.co/storage/v1/object/public/Public/hero.jpeg";

export default function ListPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // numeric in DB
  const [photoUrl, setPhotoUrl] = useState("");
  const [creating, setCreating] = useState(false);

  // gate route to signed-in users
  useEffect(() => {
    let cancelled = false;

    async function guard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      if (!cancelled) {
        // stay on page
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_evt, session) => {
        if (!session) {
          router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        }
      }
    );

    guard();
    return () => {
      cancelled = true;
      authListener.subscription?.unsubscribe();
    };
  }, [router]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a title.");
    if (!price || isNaN(Number(price))) return alert("Please enter a valid price.");
    if (!photoUrl) return alert("Please upload a photo first.");

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }

      // MATCHES your table: title (text), price (numeric), image_url (text), status (text), user_id (uuid)
      const { error } = await supabase.from("listings").insert({
        user_id: session.user.id,
        title: title.trim(),
        price: Number(price),
        image_url: photoUrl,
        status: "active"
      });

      if (error) {
        alert(`Create failed: ${error.message}`);
      } else {
        alert("Listing created!");
        setTitle("");
        setPrice("");
        setPhotoUrl("");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `url(${HERO})` }}>
        <div className="hero__overlay">
          <h1 className="hero__title">List Your Space</h1>
        </div>
      </section>

      {/* FORM CARD */}
      <main className="card">
        <h2 className="card__title">Tell Us About Your Space</h2>

        <form onSubmit={handleCreate}>
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            className="input"
            type="text"
            placeholder="e.g., Cozy backyard pool"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="label" htmlFor="price">Price (USD)</label>
          <input
            id="price"
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <label className="label">Photo</label>
          <UploadBox onUploaded={(url) => setPhotoUrl(url)} />

          {photoUrl ? (
            <div className="preview">
              <img src={photoUrl} alt="Preview" />
            </div>
          ) : null}

          <button className="btn btn--primary" disabled={creating}>
            {creating ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </main>
    </>
  );
}