import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import supabase from "@/lib/supabaseClient";
import Header from "@/components/Header";

export default function ListPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("99");
  const [file, setFile] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent("/list")}`);
        return;
      }
      setReady(true);
    })();
    return () => { mounted = false; };
  }, [router]);

  async function handleUpload() {
    try {
      setError(null);
      if (!file) { setError("Choose an image first."); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("You must be signed in."); return; }

      const userId = session.user.id;
      const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const filename = `${Date.now()}.${ext}` || `${Date.now()}`;
      const filePath = `user-${userId}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("listings").getPublicUrl(filePath);
      setPublicUrl(pub.publicUrl);
    } catch (e) {
      setError(e.message || "Upload failed");
    }
  }

  async function handleCreate() {
    try {
      setError(null);
      if (!title || !price || !publicUrl) {
        setError("Title, price, and photo are required.");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in.");

      const { error: insErr } = await supabase
        .from("listings")
        .insert({
          user_id: session.user.id,
          title,
          price: Number(price),
          photo_url: publicUrl,
          status: "published",
        });
      if (insErr) throw insErr;

      router.push("/browse");
    } catch (e) {
      setError(e.message || "Failed to create listing");
    }
  }

  if (!ready) return (
    <>
      <Header />
      <main className="container py-16"><p>Loading…</p></main>
    </>
  );

  return (
    <>
      <Header />
      <main className="container py-16">
        <div className="card p-8">
          <h1 className="text-3xl font-bold">List Your Space</h1>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cozy backyard pool"
              />
            </div>

            <div>
              <label className="label">Price (USD)</label>
              <input
                className="input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99"
              />
            </div>

            <div>
              <label className="label">Photo</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  className="input"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button type="button" className="btn" onClick={handleUpload}>
                  Upload
                </button>
              </div>
              {publicUrl && (
                <p className="mt-2 text-sm text-gray-600 break-all">
                  Uploaded: <a className="text-brand-600 underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
                </p>
              )}
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div>
              <button className="btn" onClick={handleCreate}>
                Create Listing
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}