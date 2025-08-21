"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AVATAR_BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";
const MAX_UPLOAD_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const SIGNED_URL_EXPIRES = Number(process.env.NEXT_PUBLIC_AVATAR_URL_TTL || 3600); // seconds

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [emailInitial, setEmailInitial] = useState("U");

  // profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [bio, setBio]             = useState("");
  const [avatarPath, setAvatarPath] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  // UI state
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [toast, setToast]         = useState("");

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
      setEmailInitial((session.user.email?.[0] || "U").toUpperCase());

      // load profile
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        showToast(`Error loading profile: ${error.message}`);
      }

      if (prof) {
        setFirstName(prof.first_name ?? "");
        setLastName(prof.last_name ?? "");
        setBio(prof.bio ?? "");
        setAvatarPath(prof.avatar_path ?? null);
        setSavedOnce(Boolean(prof.first_name || prof.last_name || prof.bio || prof.avatar_path));
        if (prof.avatar_path) {
          const url = await signAvatar(prof.avatar_path);
          setAvatarUrl(url || "");
        }
      } else {
        await supabase.from("profiles").insert({ id: session.user.id }).catch(() => {});
      }

      setLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function signAvatar(path) {
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRES);
    if (error) {
      console.error(error);
      return null;
    }
    return data.signedUrl;
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return showToast("Upload error: please choose JPG, PNG, WEBP or GIF.");
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      return showToast(`Upload error: file must be ≤ ${MAX_UPLOAD_MB}MB.`);
    }

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) throw upErr;

      const { error: saveErr } = await supabase.from("profiles").upsert({
        id: userId,
        avatar_path: path,
        updated_at: new Date().toISOString(),
      });
      if (saveErr) throw saveErr;

      setAvatarPath(path);
      setSavedOnce(true);

      const url = await signAvatar(path);
      setAvatarUrl(url || "");
      showToast("Profile photo updated!");
    } catch (err) {
      console.error(err);
      showToast(`Upload error: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: toNull(firstName),
        last_name: toNull(lastName),
        bio: toNull(bio),
        avatar_path: toNull(avatarPath),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSavedOnce(true);
      showToast("✅ Your profile has been updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function toNull(v) {
    if (v === null || v === undefined) return null;
    const t = typeof v === "string" ? v.trim() : v;
    return t ? t : null;
    }

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

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        {/* Avatar + upload */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-white">{emailInitial}</span>
            )}
          </div>

          <label className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-bold hover:bg-gray-50">
            {uploading ? "Uploading…" : "Upload new photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
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

          {/* Save / Update */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-70"
            >
              {saving ? "Saving..." : savedOnce ? "Update Profile" : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Toast */}
        {toast && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}