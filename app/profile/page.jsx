"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const AVATAR_BUCKET = process.env.NEXT_PUBLIC_AVATAR_BUCKET || "avatars";
const MAX_UPLOAD_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const SIGNED_URL_EXPIRES = Number(process.env.NEXT_PUBLIC_AVATAR_URL_TTL || 3600); // seconds

// Validation rules
const NAME_MIN = 1;
const NAME_MAX = 30;
const BIO_MIN = 0;
const BIO_MAX = 280;
// Letters, spaces, apostrophes, hyphens. Adjust as you like:
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

// Tiny, editable profanity list (lowercase). Add/remove as needed.
const PROFANITY = [
  "shit", "fuck", "bitch", "asshole", "bastard", "dick", "piss", "crap",
  "fag", "slut", "whore", "cunt"
];

// Replace all but first/last letter with *
function censorWord(w) {
  if (w.length <= 2) return "*".repeat(w.length);
  return w[0] + "*".repeat(w.length - 2) + w[w.length - 1];
}

function cleanProfanity(text) {
  if (!text) return text;
  // match word boundaries case-insensitively
  const re = new RegExp(`\\b(${PROFANITY.join("|")})\\b`, "gi");
  return text.replace(re, (m) => censorWord(m));
}

function hasProfanity(text) {
  if (!text) return false;
  const re = new RegExp(`\\b(${PROFANITY.join("|")})\\b`, "i");
  return re.test(text);
}

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

  // validation state
  const [errors, setErrors] = useState({ firstName: "", lastName: "", bio: "" });
  const [filterProfanity, setFilterProfanity] = useState(true);

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
        const fn = prof.first_name ?? "";
        const ln = prof.last_name ?? "";
        const b  = prof.bio ?? "";
        setFirstName(fn);
        setLastName(ln);
        setBio(b);
        setAvatarPath(prof.avatar_path ?? null);
        setSavedOnce(Boolean(fn || ln || b || prof.avatar_path));
        if (prof.avatar_path) {
          const url = await signAvatar(prof.avatar_path);
          setAvatarUrl(url || "");
        }
      } else {
        await supabase.from("profiles").insert({ id: session.user.id }).catch(() => {});
      }

      // Validate initial values
      validateAll({ firstName, lastName, bio });

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

    // client checks
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
      setAvatarUrl(url ? `${url}&r=${Date.now()}` : "");
      showToast("Profile photo updated!");

      // Optional: signal header to refresh if you did the window-event approach
      // window.dispatchEvent(new CustomEvent("avatar-updated"));
    } catch (err) {
      console.error(err);
      showToast(`Upload error: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  }

  // ---- Validation helpers
  function validateFirstName(value) {
    const v = (value || "").trim();
    if (v.length < NAME_MIN) return "First name is required.";
    if (v.length > NAME_MAX) return `First name must be ≤ ${NAME_MAX} characters.`;
    if (!NAME_REGEX.test(v)) return "Only letters, spaces, apostrophes, and hyphens are allowed.";
    return "";
  }

  function validateLastName(value) {
    const v = (value || "").trim();
    if (v.length < NAME_MIN) return "Last name is required.";
    if (v.length > NAME_MAX) return `Last name must be ≤ ${NAME_MAX} characters.`;
    if (!NAME_REGEX.test(v)) return "Only letters, spaces, apostrophes, and hyphens are allowed.";
    return "";
  }

  function validateBio(value) {
    const v = (value || "");
    if (v.length < BIO_MIN) return `Bio must be at least ${BIO_MIN} characters.`;
    if (v.length > BIO_MAX) return `Bio must be ≤ ${BIO_MAX} characters.`;
    // profanity handled by toggle; no error here unless you want to block when toggle is off
    return "";
  }

  function validateAll({ firstName: fn, lastName: ln, bio: b }) {
    const firstNameErr = validateFirstName(fn);
    const lastNameErr  = validateLastName(ln);
    const bioErr       = validateBio(b);
    setErrors({ firstName: firstNameErr, lastName: lastNameErr, bio: bioErr });
    // return whether valid
    return !(firstNameErr || lastNameErr || bioErr);
  }

  // ---- Save profile (with optional profanity filtering)
  async function handleSave(e) {
    e.preventDefault();
    if (!userId) return;

    // validate before save
    const ok = validateAll({ firstName, lastName, bio });
    if (!ok) {
      showToast("Please fix the errors before saving.");
      return;
    }

    let finalBio = bio;
    if (filterProfanity && hasProfanity(finalBio)) {
      finalBio = cleanProfanity(finalBio);
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: toNull(firstName),
        last_name: toNull(lastName),
        bio: toNull(finalBio),
        avatar_path: toNull(avatarPath),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // reflect any censored bio in the UI
      setBio(finalBio);
      setSavedOnce(true);
      showToast("✅ Your profile has been updated successfully!");
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  }

  function toNull(v) {
    if (v === null || v === undefined) return null;
    const t = typeof v === "string" ? v.trim() : v;
    return t ? t : null;
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  // re-validate as the user types
  useEffect(() => {
    setErrors((prev) => ({ ...prev, firstName: validateFirstName(firstName) }));
  }, [firstName]);
  useEffect(() => {
    setErrors((prev) => ({ ...prev, lastName: validateLastName(lastName) }));
  }, [lastName]);
  useEffect(() => {
    setErrors((prev) => ({ ...prev, bio: validateBio(bio) }));
  }, [bio]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold text-cyan-500 tracking-tight">Profile</h1>
        <p className="mt-4">Loading…</p>
      </main>
    );
  }

  const hasAnyError = Boolean(errors.firstName || errors.lastName || errors.bio);

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

        {/* Profanity filter toggle */}
        <div className="mt-6 flex items-center gap-3">
          <input
            id="profanity"
            type="checkbox"
            checked={filterProfanity}
            onChange={(e) => setFilterProfanity(e.target.checked)}
            className="h-4 w-4 accent-cyan-500"
          />
          <label htmlFor="profanity" className="text-sm">
            Filter profanity in bio (will automatically censor bad words on save)
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.firstName ? "border-red-400 focus:ring-red-300" : "focus:ring-cyan-500"
              }`}
              placeholder="First name"
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.lastName ? "border-red-400 focus:ring-red-300" : "focus:ring-cyan-500"
              }`}
              placeholder="Last name"
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-gray-600 mb-1">Bio</label>
              <span className={`text-xs ${bio.length > BIO_MAX ? "text-red-600" : "text-gray-500"}`}>
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 h-28 resize-y focus:outline-none focus:ring-2 ${
                errors.bio ? "border-red-400 focus:ring-red-300" : "focus:ring-cyan-500"
              }`}
              placeholder="Tell people about yourself…"
            />
            {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio}</p>}
          </div>

          {/* Save / Update */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || hasAnyError}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-white hover:text-black disabled:opacity-50"
              title={hasAnyError ? "Please fix the errors above" : ""}
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