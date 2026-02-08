import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useLocation } from '../context/LocationContext';
import { MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Custom blue marker icon
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker() {
  const { location, fetchSatelliteData, loading } = useLocation();

  useMapEvents({
    click(e) {
      if (!loading) {
        fetchSatelliteData(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  if (!location) return null;

  return (
    <Marker position={[location.lat, location.lon]} icon={blueIcon}>
      <Popup>
        <div className="text-sm">
          <p className="font-semibold text-gray-800">Selected Location</p>
          <p className="font-mono text-xs text-gray-600">
            {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function SharedMap({ height = 'h-full', className = '', showOverlay = true }) {
  const { location, satelliteData, loading } = useLocation();

  return (
    <div className={`relative ${height} ${className} rounded-xl overflow-hidden border border-[var(--color-border)]`}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker />
        {location && <MapController center={[location.lat, location.lon]} />}
      </MapContainer>

      {/* Click instruction overlay */}
      {!location && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--color-bg-card)]/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[var(--color-border)] flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <MapPin className="w-4 h-4 text-[var(--color-accent-light)]" />
          Click anywhere on the map to select a location
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-[var(--color-bg-card)]/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-[var(--color-accent)] flex items-center gap-2 text-sm text-[var(--color-accent-light)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          Acquiring satellite data...
        </div>
      )}

      {/* Location info overlay */}
      {showOverlay && location && !loading && satelliteData && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-[var(--color-bg-card)]/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-[var(--color-border)] text-xs">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[var(--color-text-muted)] mb-0.5">Coordinates</p>
              <p className="font-mono text-[var(--color-text-primary)]">
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div>
              <p className="text-[var(--color-text-muted)] mb-0.5">Confidence</p>
              <p className="text-[var(--color-success)] font-semibold">{satelliteData.summary.confidence}%</p>
            </div>
            <div className="w-px h-8 bg-[var(--color-border)]" />
            <div>
              <p className="text-[var(--color-text-muted)] mb-0.5">Quality</p>
              <p className="text-[var(--color-text-primary)]">{satelliteData.summary.data_quality}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
