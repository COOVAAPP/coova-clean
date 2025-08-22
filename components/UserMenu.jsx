"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function UserMenu({ initial, avatarUrl, onSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Account menu"
        onClick={(e) => {
          e.stopPropagation(); // don't bubble to document
          setOpen((v) => !v);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white font-bold"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-9 w-9 rounded-full object-cover"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          (initial || "U").toUpperCase()
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()} // clicks inside shouldn't bubble
        >
          <ul className="py-1 text-sm">
            <li>
              <Link className="block px-3 py-2 hover:bg-gray-50" href="/profile">
                Profile
              </Link>
            </li>
            <li>
              <Link className="block px-3 py-2 hover:bg-gray-50" href="/dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onSignOut?.();
                  setOpen(false);
                }}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}