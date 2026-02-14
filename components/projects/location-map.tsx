'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  label?: string;
}

export function LocationMap({ latitude, longitude, label }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView(
        [latitude || 20, longitude || 0],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Update marker position when coordinates change
    if (latitude !== null && longitude !== null && map.current) {
      map.current.setView([latitude, longitude], 13);

      if (marker.current) {
        marker.current.setLatLng([latitude, longitude]);
      } else {
        marker.current = L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl:
              'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .bindPopup(label || 'Location')
          .addTo(map.current)
          .openPopup();
      }
    }
  }, [latitude, longitude, label]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 rounded-md border border-slate-200 bg-slate-100"
    />
  );
}
