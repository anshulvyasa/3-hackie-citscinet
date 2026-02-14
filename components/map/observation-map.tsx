'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Observation } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

/* ---------- CATEGORY COLORS ---------- */

const categoryColors = {
  Water: '#3b82f6',
  Wildlife: '#f59e0b',
  Air: '#8b5cf6',
  Plants: '#10b981',
};

function createCategoryIcon(category: string) {
  const color = categoryColors[category as keyof typeof categoryColors];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
      ">
        ${category.charAt(0)}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

/* ---------- ZOOM HANDLER COMPONENT ---------- */

function ZoomToSelected({ selectedObservation }: { selectedObservation: Observation | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedObservation) return;

    map.setView(
      [selectedObservation.latitude, selectedObservation.longitude],
      15,
      { animate: true }
    );
  }, [selectedObservation, map]);

  return null;
}

/* ---------- MARKER CLUSTER ---------- */

function MarkerClusterGroup({
  observations,
}: {
  observations: Observation[];
}) {
  const map = useMap();

  useEffect(() => {
    const markerClusterGroup = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    observations.forEach((obs) => {
      const marker = L.marker(
        [obs.latitude, obs.longitude],
        { icon: createCategoryIcon(obs.category) }
      );

      marker.bindPopup(`
        <div style="min-width:200px">
          <h3><strong>${obs.sighting_name}</strong></h3>
          <p>${obs.category}</p>
          ${obs.description ? `<p>${obs.description}</p>` : ''}
          ${obs.image_url ? `<img src="${obs.image_url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-top:6px;" />` : ''}
          <p style="font-size:12px;margin-top:6px;">
            ${formatDistanceToNow(new Date(obs.created_at), { addSuffix: true })}
          </p>
        </div>
      `);

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    if (observations.length > 0) {
      const bounds = L.latLngBounds(
        observations.map((obs) => [obs.latitude, obs.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [observations, map]);

  return null;
}

/* ---------- MAIN COMPONENT ---------- */

interface ObservationMapProps {
  observations: Observation[];
  selectedObservation: Observation | null;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function ObservationMap({
  observations,
  selectedObservation,
  center = [37.7749, -122.4194],
  zoom = 12,
  className = '',
}: ObservationMapProps) {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`${className} relative z-0`}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 THIS handles zoom */}
      <ZoomToSelected selectedObservation={selectedObservation} />

      <MarkerClusterGroup observations={observations} />
    </MapContainer>
  );
}
