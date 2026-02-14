'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  label: string;
  latitude?: number;
  longitude?: number;
}

interface ProjectDetailMapProps {
  locations: Location[];
}

export function ProjectDetailMap({ locations }: ProjectDetailMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || locations.length === 0) return;

    // Initialize map only once
    if (!map.current) {
      const centerLat = locations[0].latitude || 20;
      const centerLng = locations[0].longitude || 0;

      map.current = L.map(mapContainer.current).setView([centerLat, centerLng], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add markers for all locations
    if (map.current) {
      const group = new L.FeatureGroup();

      locations.forEach((location, index) => {
        if (
          location.latitude !== undefined &&
          location.longitude !== undefined &&
          location.latitude !== null &&
          location.longitude !== null
        ) {
          const colors = [
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png',
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png',
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-yellow.png',
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-violet.png',
          ];

          const lat = location.latitude;
          const lng = location.longitude;

          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: colors[index % colors.length],
              shadowUrl:
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          })
            .bindPopup(`<strong>${location.label}</strong><br/>${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .addTo(map.current!);

          markers.current.push(marker);
          group.addLayer(marker);
        }
      });

      // Fit map to all markers
      if (markers.current.length > 0 && map.current) {
        const bounds = group.getBounds();
        map.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [locations]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 rounded-md border border-slate-200 bg-slate-100"
    />
  );
}
