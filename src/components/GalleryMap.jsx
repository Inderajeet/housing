// src/components/ProjectDetails/GalleryMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import '../styles/GalleryMap.css'; // Import CSS file

const GalleryMap = ({ location, title, status }) => {
  // Check for valid location data
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return (
      <div className="gallery-map-unavailable">
        📍 Map Location Unavailable
      </div>
    );
  }
  
  const position = [location.lat, location.lng];
  const zoomLevel = 15;

  // Determine color based on status
  const getMarkerColor = () => {
    const normalized = String(status || '').toLowerCase().replace(/[\s_-]/g, '');
    
    if (normalized === 'nilbooking' || normalized === 'nil' || normalized === 'available') {
      return '#22c55e'; // Green
    }
    if (normalized === 'onbooking') {
      return '#f59e0b'; // Orange/Yellow
    }
    if (normalized === 'sold' || normalized === 'rented' || normalized === 'booked') {
      return '#ef4444'; // Red
    }
    return '#3b82f6'; // Blue default
  };

  const markerColor = getMarkerColor();

  // Create custom icon with the determined color
  const customIcon = L.divIcon({
    className: `gallery-marker status-${String(status || '').toLowerCase().replace(/[\s_-]/g, '')}`,
    html: `
      <div class="marker-wrapper">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="${markerColor}" stroke="white" stroke-width="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="3" fill="white" stroke="${markerColor}" stroke-width="1.5"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });

  return (
    <MapContainer
      center={position}
      zoom={zoomLevel}
      scrollWheelZoom={false}
      className="gallery-map"
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon} />
    </MapContainer>
  );
};

export default GalleryMap;