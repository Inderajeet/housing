import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import '../styles/UnifiedMap.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const UnifiedMap = ({ properties = [], mapCenter, mapZoom }) => {
  const navigate = useNavigate();
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const prevCenterRef = useRef(null);
  const prevZoomRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.GOOGLE_MAPS_API
  });

  const center = useMemo(() => ({
    lat: mapCenter?.[0] || 10.7905,
    lng: mapCenter?.[1] || 78.7047
  }), [mapCenter]);

  const zoom = mapZoom || 7;

  // Smooth transition when center or zoom changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const currentCenter = mapRef.current.getCenter();
    const currentZoom = mapRef.current.getZoom();
    
    // Calculate distance between current and target center
    const latDiff = Math.abs(currentCenter.lat() - center.lat);
    const lngDiff = Math.abs(currentCenter.lng() - center.lng);
    const isFarAway = latDiff > 2 || lngDiff > 2; // If moving between cities

    if (isFarAway) {
      // For long distances, first zoom out, then pan, then zoom in
      const zoomOutLevel = 7; // Zoom out to state level
      
      // Step 1: Zoom out
      mapRef.current.setZoom(zoomOutLevel);
      
      // Step 2: After a tiny delay, pan to new location
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.panTo(center);
        }
      }, 300);
      
      // Step 3: After pan completes, zoom in
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(zoom);
        }
      }, 800);
    } else {
      // For short distances, just pan smoothly
      mapRef.current.panTo(center);
      // Update zoom after pan
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setZoom(zoom);
        }
      }, 500);
    }

    prevCenterRef.current = center;
    prevZoomRef.current = zoom;

  }, [center, zoom, mapLoaded]);

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Price on request';
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const capitalizeFirst = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getMarkerColor = (status) => {
    const normalized = String(status || '')
      .toLowerCase()
      .replace(/[\s_-]/g, '');

    if (normalized === 'nilbooking' || normalized === 'nil' || normalized === 'available') {
      return '#22c55e';
    }
    if (normalized === 'onbooking') {
      return '#f59e0b';
    }
    if (normalized === 'sold' || normalized === 'rented' || normalized === 'booked') {
      return '#ef4444';
    }
    return '#3b82f6';
  };

  const createMarkerIcon = (color) => {
    return {
      url: `data:image/svg+xml,%3Csvg width='24' height='36' viewBox='0 0 28 42' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0C6.82 0 1 5.82 1 13c0 9.75 13 29 13 29s13-19.25 13-29C27 5.82 21.18 0 14 0z' fill='${encodeURIComponent(color)}'/%3E%3Ccircle cx='14' cy='13' r='6' fill='%23ffffff'/%3E%3C/svg%3E`,
      scaledSize: { width: 24, height: 36 },
      anchor: { x: 12, y: 36 }
    };
  };

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const infoWindowOptions = {
    pixelOffset: { width: 0, height: -30 },
    maxWidth: 280,
    disableAutoPan: true,
  };

  if (!isLoaded) return <div className="unified-map-loading">Loading Map...</div>;

  return (
    <div className="unified-map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
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
      >
        {properties.map((property, index) => {
          const lat = Number(property.latitude);
          const lng = Number(property.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          const isRent = !!property.rent_amount;
          const isCommercial = (property.property_use || '').toLowerCase() === 'commercial';
          const extentLabel = [property.extent_area, property.extent_unit].filter(Boolean).join(' ').trim();
          const saleTypeLabel = capitalizeFirst(property.sale_type);
          const statusValue = isRent ? property.rent_status : property.sale_status;
          const color = getMarkerColor(statusValue);

          return (
            <Marker
              key={property.property_id || index}
              position={{ lat, lng }}
              icon={createMarkerIcon(color)}
              onMouseOver={() => setHoveredProperty(property)}
              onMouseOut={() => setHoveredProperty(null)}
              onClick={() => {
                navigate(`/property/${property.property_id}`, {
                  state: { propertyData: property }
                });
              }}
            />
          );
        })}

        {hoveredProperty && (
          <InfoWindow
            position={{ 
              lat: Number(hoveredProperty.latitude), 
              lng: Number(hoveredProperty.longitude) 
            }}
            onCloseClick={() => setHoveredProperty(null)}
            options={infoWindowOptions}
          >
            <div className="property-popup">
              <div className="popup-content">
                <div className="popup-header">
                  {hoveredProperty.formatted_id || hoveredProperty.title || 'Property'}
                </div>

                <div className="popup-price">
                  {hoveredProperty.rent_amount
                    ? formatPrice(hoveredProperty.rent_amount)
                    : formatPrice(hoveredProperty.sale_price)}
                  {hoveredProperty.rent_amount && <span className="price-period">/mo</span>}
                </div>

                <div className="popup-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">
                      {hoveredProperty.rent_amount
                        ? ((hoveredProperty.property_use || '').toLowerCase() === 'commercial' 
                          ? 'Commercial' 
                          : `${hoveredProperty.bhk || ''} BHK`.trim())
                        : capitalizeFirst(hoveredProperty.sale_type) || 'Property'}
                    </span>
                  </div>

                  {hoveredProperty.extent_area && hoveredProperty.extent_unit && (
                    <div className="detail-item">
                      <span className="detail-label">Area</span>
                      <span className="detail-value">
                        {[hoveredProperty.extent_area, hoveredProperty.extent_unit].filter(Boolean).join(' ').trim()}
                      </span>
                    </div>
                  )}

                  {hoveredProperty.rent_amount && hoveredProperty.advance_amount && (
                    <div className="detail-item">
                      <span className="detail-label">Advance</span>
                      <span className="detail-value">
                        {formatPrice(hoveredProperty.advance_amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="popup-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    {[hoveredProperty.taluk_name, hoveredProperty.village_name].filter(Boolean).join(', ') || 'Location available'}
                  </span>
                </div>

                <div className="popup-hint">
                  Click marker to view details
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default UnifiedMap;