import React, { useMemo, useEffect, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  useJsApiLoader
} from '@react-google-maps/api';
import '../styles/GalleryMap.css';

const GalleryMap = ({ location, status, title }) => {
  // Always call ALL hooks at the top level
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.GOOGLE_MAPS_API
  });

  // Create a ref to store the map instance
  const mapRef = useRef(null);

  // Determine color based on status (same as your Leaflet version)
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

  // Memoize position
  const position = useMemo(() => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return null;
    }
    return {
      lat: location.lat,
      lng: location.lng
    };
  }, [location?.lat, location?.lng]);

  // Create custom marker with status-based color
  const createCustomMarker = (color) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24),
      labelOrigin: new window.google.maps.Point(12, 9)
    };
  };

  // Create inner circle marker
  const createInnerCircle = (color) => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: "#FFFFFF",
      fillOpacity: 1,
      strokeColor: color,
      strokeWeight: 2,
      scale: 4.5,
      anchor: new window.google.maps.Point(12, 24)
    };
  };

  // Effect to handle street view when map loads or position changes
  useEffect(() => {
    if (mapRef.current && position && window.google) {
      // Small timeout to ensure map is fully ready
      const timeoutId = setTimeout(() => {
        const streetView = mapRef.current.getStreetView();
        streetView.setPosition(position);
        streetView.setPov({
          heading: 100,
          pitch: 0,
          zoom: 1
        });
        streetView.setVisible(true);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [mapRef.current, position]);

  // Handle map load
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Now conditional returns after all hooks
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return (
      <div className="gallery-map-unavailable">
        📍 Map Location Unavailable
      </div>
    );
  }

  if (loadError) {
    return <div className="gallery-map-error">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="gallery-map-loading">Loading...</div>;
  }

  const markerColor = getMarkerColor();
  const statusClass = String(status || '').toLowerCase().replace(/[\s_-]/g, '');

  return (
    <div
      className={`gallery-map-container status-${statusClass}`}
      style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={position}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
        onLoad={onMapLoad}
      >
        {window.google && (
          <>
            {/* Main marker (pin shape) */}
            <Marker
              position={position}
              icon={createCustomMarker(markerColor)}
            />
            {/* Inner circle marker */}
            <Marker
              position={position}
              icon={createInnerCircle(markerColor)}
            />
          </>
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(GalleryMap);