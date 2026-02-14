'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Observation } from '@/lib/supabase/types';
import { formatDistanceToNow } from 'date-fns';

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
l̥      ">
        ${category.charAt(0)}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

interface MarkerClusterGroupProps {
  observations: Observation[];
  onMarkerClick?: (observation: Observation) => void;
}

function MarkerClusterGroup({
  observations,
  onMarkerClick,
}: MarkerClusterGroupProps) {
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
      const marker = L.marker([obs.latitude, obs.longitude], {
        icon: createCategoryIcon(obs.category),
      });

      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-base mb-1">${obs.sighting_name}</h3>
          <p class="text-sm text-muted-foreground mb-2">
            <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  style="background-color: ${
                    categoryColors[obs.category as keyof typeof categoryColors]
                  }20; color: ${
        categoryColors[obs.category as keyof typeof categoryColors]
      }">
              ${obs.category}
            </span>
          </p>
          ${
            obs.description
              ? `<p class="text-sm mb-2">${obs.description}</p>`
              : ''
          }
          ${
            obs.image_url
              ? `<img src="${obs.image_url}" alt="${obs.sighting_name}" class="w-full h-32 object-cover rounded mb-2" />`
              : ''
          }
          <p class="text-xs text-muted-foreground">
            ${formatDistanceToNow(new Date(obs.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      `);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(obs));
      }

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
  }, [observations, map, onMarkerClick]);

  return null;
}

interface ObservationMapProps {
  observations: Observation[];
  onMarkerClick?: (observation: Observation) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function ObservationMap({
  observations,
  onMarkerClick,
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
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`${className} relative z-0`}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup
        observations={observations}
        onMarkerClick={onMarkerClick}
      />
    </MapContainer>
  );
}
