"use client";
import { memo } from "react";

// Very small icon map (expand whenever you like)
const ICONS = {
  wifi: "📶",
  parking: "🅿️",
  pool: "🏊",
  kitchen: "🍳",
  bathroom: "🚽",
  ac: "❄️",
  heater: "🔥",
  power: "🔌",
  lights: "💡",
  sound: "🔊",
  towels: "🫔",
  pooltoys: "🛟",

};

function normalize(name) {
  return String(name || "").toLowerCase().trim();
}

function AmenityPill({ name }) {
  const key = normalize(name);
  const icon = ICONS[key] || "•";
  return (
    <span
      className="
        inline-flex items-center gap-2 rounded-full 
        border border-cyan-200 bg-white/80 px-3 py-1 
        text-xs font-medium text-gray-700
        shadow-sm hover:border-cyan-300 hover:bg-cyan-50
        transition-colors
      "
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="leading-none">{name}</span>
    </span>
  );
}

export default memo(AmenityPill);