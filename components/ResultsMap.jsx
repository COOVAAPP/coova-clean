"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Fit the map to markers (and optional user location)
function FitTo({ markers, user }) {
  const map = useMap();

  const bounds = useMemo(() => {
    const b = L.latLngBounds([]);
    markers?.forEach((m) => {
      if (Number.isFinite(m.lat) && Number.isFinite(m.lng)) b.extend([m.lat, m.lng]);
    });
    if (user && Number.isFinite(user.lat) && Number.isFinite(user.lng)) {
      b.extend([user.lat, user.lng]);
    }
    return b.isValid() ? b : null;
  }, [markers, user]);

  useEffect(() => {
    if (!map) return;
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (user) {
      map.setView([user.lat, user.lng], 12);
    } else {
      map.setView([38.9072, -77.0369], 12); // fallback: DC
    }
  }, [map, bounds, user]);

  return null;
}

export default function ResultsMap({
  markers = [],         // [{ id, lat, lng, title, href }]
  userLocation = null,  // { lat, lng } | null
  className = "",
  height = 420,
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={[38.9072, -77.0369]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitTo markers={markers} user={userLocation} />

        {/* Search results */}
        {markers.map((m) =>
          Number.isFinite(m.lat) && Number.isFinite(m.lng) ? (
            <Marker key={m.id} position={[m.lat, m.lng]}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{m.title || "Listing"}</p>
                  {m.href && (
                    <a
                      href={m.href}
                      className="text-cyan-600 hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* User location */}
        {userLocation &&
          Number.isFinite(userLocation.lat) &&
          Number.isFinite(userLocation.lng) && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}
      </MapContainer>
    </div>
  );
}