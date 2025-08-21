"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const AVATAR_BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";
  const MAX_UPLOAD_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [bio, setBio]             = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    let mounted = true;

    // Ensure user is logged in
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const s = data.session;
      setSession(s);
      if (!s) {
        router.replace("/login");
        return;
      }
      // Load existing profile
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", s.user.id)
        .maybeSingle();

      if (error) console.error(error);

      if (prof) {
        setFirstName(prof.first_name || "");
        setLastName(prof.last_name || "");
        setBio(prof.bio || "");
        setAvatarUrl(prof.avatar_url || "");
      } else {
        // Seed row for this user so updates work
        await supabase.from("profiles").insert({ id: s.user.id }).catch(() => {});
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    setMsg("");

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    setMsg(error ? `Error: ${error.message}` : "Profile saved!");
  };

  const handleUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file || !session) return;

  // Basic client checks
  if (!ALLOWED_TYPES.includes(file.type)) {
    setMsg("Upload error: please choose a JPG, PNG, WEBP or GIF image.");
    return;
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    setMsg(`Upload error: file must be ≤ ${MAX_UPLOAD_MB}MB.`);
    return;
  }

  setUploading(true);
  setMsg("");

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${session.user.id}/${Date.now()}.${ext}`;

    // Upload
    const { error: upErr } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) throw upErr;

    // Public URL
    const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = pub.publicUrl;
    setAvatarUrl(publicUrl);

    // Save to profile
    const { error: saveErr } = await supabase.from("profiles").upsert({
      id: session.user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    });
    if (saveErr) throw saveErr;

    setMsg("Profile photo updated!");
  } catch (err) {
    setMsg(`Upload error: ${err.message || err}`);
  } finally {
    setUploading(false);
  }
};

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Profile</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Profile</h1>

      {/* Card */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Avatar + upload */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-white">
                {(session?.user?.email?.[0] || "U").toUpperCase()}
              </span>
            )}
          </div>
          <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50">
            {uploading ? "Uploading…" : "Upload new photo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Last name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-md border px-3 py-2 h-28 resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Tell people about yourself…"
            />
          </div>

        {/* Save */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </main>
  );
}