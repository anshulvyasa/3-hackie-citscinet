'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMarkerProps {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onLocationSelect }: LocationMarkerProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    position
  );

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      setMarkerPosition(position);
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return markerPosition === null ? null : (
    <Marker position={markerPosition} icon={defaultIcon} />
  );
}

interface LocationPickerProps {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  position,
  onLocationSelect,
}: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 w-full bg-muted flex items-center justify-center rounded-md">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const center: [number, number] = position || [37.7749, -122.4194];

  return (
    <div className="h-64 w-full rounded-md overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}
