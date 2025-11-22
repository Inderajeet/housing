// src/components/ProjectDetails/GalleryMap.jsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import L for custom icon

// Custom marker icon to make it stand out
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const GalleryMap = ({ location, title }) => {
    // Check for valid location data
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '0.5rem' }}>
                Map Location Unavailable
            </div>
        );
    }
    
    const position = [location.lat, location.lng];
    const zoomLevel = 15; // Zoom in a bit more for a property location (default is often 13)

    return (
        <MapContainer
            center={position}
            zoom={zoomLevel}
            scrollWheelZoom={false} // Disable zoom on scroll
            style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={customIcon}>
                <Popup>{title}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default GalleryMap;