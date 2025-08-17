// components/CategoryCard.jsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ name, image_url, href }) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 hover:shadow-md hover:ring-black/10 transition-all"
    >
      <div className="relative h-40 w-full">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            priority={false}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />
        )}
        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors" />
      </div>

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <h3 className="text-white font-semibold drop-shadow-sm">{name}</h3>
        <span className="text-xs text-white/90 bg-black/30 px-2 py-1 rounded-md">
          Explore
        </span>
      </div>
    </Link>
  );
}