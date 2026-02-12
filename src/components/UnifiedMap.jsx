import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import '../styles/UnifiedMap.css';

// Fix Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapViewHandler = ({ center, zoom }) => {
  const map = useMap();
  const lastUpdateRef = useRef("");

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;

    const currentKey = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;

    if (lastUpdateRef.current !== currentKey) {
      lastUpdateRef.current = currentKey;
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, zoom, map]);

  return null;
};

const UnifiedMap = ({ properties = [], mapCenter, mapZoom }) => {
  const finalCenter = mapCenter || [10.7905, 78.7047];
  const finalZoom = mapZoom || 7;
  const navigate = useNavigate();

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

  const getMarkerIcon = (status) => {
    const color = getMarkerColor(status);
    return L.divIcon({
      className: `status-marker status-${String(status || '').toLowerCase().replace(/[\s_-]/g, '')}`,
      html: `
        <svg width="24" height="36" viewBox="0 0 28 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14 0C6.82 0 1 5.82 1 13c0 9.75 13 29 13 29s13-19.25 13-29C27 5.82 21.18 0 14 0z" fill="${color}"/>
          <circle cx="14" cy="13" r="6" fill="#ffffff"/>
        </svg>
      `,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -30]
    });
  };

  return (
    <div className="unified-map-container">
      <MapContainer
        center={finalCenter}
        zoom={finalZoom}
        className="unified-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        <MapViewHandler center={finalCenter} zoom={finalZoom} />

        {properties.map((property, index) => {
          const lat = Number(property.latitude);
          const lng = Number(property.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          const isRent = !!property.rent_amount;
          const isCommercial = (property.property_use || '').toLowerCase() === 'commercial';
          const extentLabel = [property.extent_area, property.extent_unit].filter(Boolean).join(' ').trim();
          const saleTypeLabel = capitalizeFirst(property.sale_type);
          const statusValue = isRent ? property.rent_status : property.sale_status;

          return (
            <Marker
              key={property.property_id || index}
              position={[lat, lng]}
              icon={getMarkerIcon(statusValue)}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
                click: () => {
                  navigate(`/property/${property.property_id}`, {
                    state: { propertyData: property }
                  });
                }
              }}
            >
              <Popup closeButton={false} className="property-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    {property.formatted_id || property.title || 'Property'}
                  </div>

                  <div className="popup-price">
                    {isRent 
                      ? formatPrice(property.rent_amount)
                      : formatPrice(property.sale_price)
                    }
                    {isRent && <span className="price-period">/mo</span>}
                  </div>

                  <div className="popup-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">
                        {isRent 
                          ? (isCommercial ? 'Commercial' : `${property.bhk || ''} BHK`.trim())
                          : saleTypeLabel || 'Property'
                        }
                      </span>
                    </div>

                    {extentLabel && (
                      <div className="detail-item">
                        <span className="detail-label">Area</span>
                        <span className="detail-value">{extentLabel}</span>
                      </div>
                    )}

                    {isRent && property.advance_amount && (
                      <div className="detail-item">
                        <span className="detail-label">Advance</span>
                        <span className="detail-value">
                          {formatPrice(property.advance_amount)}
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
                      {[property.taluk_name, property.village_name].filter(Boolean).join(', ') || 'Location available'}
                    </span>
                  </div>

                  <div className="popup-hint">
                    Click marker to view details
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default UnifiedMap;