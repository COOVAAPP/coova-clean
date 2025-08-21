"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AVATAR_BUCKET = "avatars";
const SIGNED_URL_EXPIRES = 3600; // 1 hour
const edgeBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

async function edgeUploadAvatar(file, accessToken) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${edgeBase}/upload-avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Upload failed");
  return JSON.parse(text); // { path }
}

async function edgeDeleteAvatar(path, accessToken) {
  const res = await fetch(`${edgeBase}/delete-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Delete failed");
  return JSON.parse(text); // { ok: true }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [bio, setBio]             = useState("");

  const [avatarPath, setAvatarPath] = useState(null);
  const [avatarUrl, setAvatarUrl]   = useState("");
  const [initial, setInitial]       = useState("U");

  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]       = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/login");
      setUser(session.user);
      setInitial((session.user.email?.[0] || "U").toUpperCase());

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, bio, avatar_path")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) console.error(error);
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
        setAvatarPath(data.avatar_path || null);

        if (data.avatar_path) {
          const { data: signed } = await supabase.storage
            .from(AVATAR_BUCKET)
            .createSignedUrl(data.avatar_path, SIGNED_URL_EXPIRES);
          if (signed?.signedUrl) setAvatarUrl(signed.signedUrl);
        }
      } else {
        // ensure row exists
        await supabase.from("profiles").insert({ id: session.user.id }).catch(() => {});
      }
    })();
  }, [router]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // Upload via Edge Function (50MB limit)
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { path } = await edgeUploadAvatar(file, session.access_token);

      // save reference
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          avatar_path: path,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;

      setAvatarPath(path);

      const { data: signed } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(path, SIGNED_URL_EXPIRES);
      if (signed?.signedUrl) {
        // cache-buster so Header swaps instantly
        setAvatarUrl(`${signed.signedUrl}&r=${Date.now()}`);
      }
      showToast("Profile photo updated!");
      // window.dispatchEvent(new CustomEvent("avatar-updated")); // if you also use the window-event approach
    } catch (err) {
      console.error(err);
      showToast(`Upload error: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  }

  // Delete avatar via Edge Function
  async function handleDelete() {
    if (!avatarPath || !user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await edgeDeleteAvatar(avatarPath, session.access_token);
      setAvatarUrl("");
      setAvatarPath(null);
      showToast("Avatar removed");
    } catch (err) {
      console.error(err);
      showToast(`Delete error: ${err.message || err}`);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        bio: bio?.trim() || null,
        avatar_path: avatarPath || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      showToast("✅ Your profile has been updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Profile</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Avatar + upload/delete */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-white">{initial}</span>
            )}
          </div>

          <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50">
            {uploading ? "Uploading…" : "Upload new photo"}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          {avatarPath && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="mt-6 grid grid-cols-1 gap-4">
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
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              <span className="text-xs text-gray-500">{bio.length}/280</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Tell people about yourself…"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Update"}
        </button>

        {toast && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}