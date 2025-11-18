import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Mock Location Data Structure (copied from HomePage for context)
const LOCATION_DATA = {
  Chennai: { /* ... data ... */ },
  Coimbatore: { /* ... data ... */ },
};

// --- Sub-Component 1: Handles Map View (Center/Zoom) ---
const MapViewHandler = ({ mapCenter, mapZoom }) => {
    const map = useMap();
    React.useEffect(() => {
        map.flyTo(mapCenter, mapZoom, {
            duration: 0.8 
        });
    }, [map, mapCenter, mapZoom]);
    return null;
};

// --- Sub-Component 2: Handles Markers (Home Mode only) ---
const MarkerLayer = React.memo(({ properties }) => {
    const markers = React.useMemo(() => {
        return properties.map((property, index) => (
            <Marker key={index} position={[property.location.lat, property.location.lng]}>
                <Popup>
                    <div>
                        <strong>{property.title}</strong><br/>
                        {property.price}<br/>
                        {property.bhk} • {property.area} sq. ft.
                    </div>
                </Popup>
            </Marker>
        ));
    }, [properties]);
    return markers;
});

// --- Sub-Component 3: Handles GeoJSON Boundary (Home Mode only) ---
const GeoJsonBoundaryLayer = React.memo(({ activeDistrict }) => {
    const map = useMap();
    const geojsonLayerRef = React.useRef(null);
    
    const GEOJSON_PATHS = {
        'Chennai': '/data/chennai_district.json',
        // Add more entries here
    };
    const boundaryStyle = {
        color: '#007bff', weight: 3, opacity: 1, fillColor: '#007bff', fillOpacity: 0.1       
    };
    const geoJsonPath = GEOJSON_PATHS[activeDistrict];

    React.useEffect(() => {
        // 1. Cleanup old layer
        if (geojsonLayerRef.current) {
            map.removeLayer(geojsonLayerRef.current);
            geojsonLayerRef.current = null;
        }

        // 2. Load new boundary if a path exists
        if (!geoJsonPath) return; 

        const loadBoundary = async () => {
            try {
                const response = await fetch(geoJsonPath);
                if (!response.ok) return; 

                const geojsonData = await response.json();

                // 3. Create and add the GeoJSON layer
                geojsonLayerRef.current = L.geoJson(geojsonData, {
                    style: boundaryStyle,
                    onEachFeature: (feature, layer) => {
                        if (feature.properties && feature.properties.name) {
                            layer.bindPopup(`<strong>Boundary:</strong> ${feature.properties.name}`);
                        }
                    }
                }).addTo(map);

            } catch (error) {
                console.error("Error processing GeoJSON:", error);
            }
        };

        loadBoundary();

        // 4. Cleanup on unmount/re-render
        return () => {
            if (geojsonLayerRef.current) {
                map.removeLayer(geojsonLayerRef.current);
            }
        };
    }, [geoJsonPath, map]);

    return null;
});


// --- Unified Map Component ---
const UnifiedMap = ({ 
    mode = 'landing',
    properties = [], 
    mapCenter = [10.7905, 78.7047],
    mapZoom = 7, 
    activeDistrict = '' 
}) => {
    
    const isLanding = mode === 'landing';

    const initialCenter = isLanding ? [10.7905, 78.7047] : mapCenter;
    const initialZoom = isLanding ? 7 : mapZoom;
    const scrollWheelZoom = isLanding ? false : true;
    const attributionControl = isLanding ? false : true;

    // Use unique key to force React to unmount/remount when mode changes
    const containerKey = `${mode}-map-${isLanding ? 'landing' : 'home'}`;

    return (
        <MapContainer 
            key={containerKey}
            center={initialCenter} 
            zoom={initialZoom} 
            scrollWheelZoom={scrollWheelZoom}
            attributionControl={attributionControl}
            className={isLanding ? "landing-map-component" : "home-map-component"} 
            style={{ 
                height: '100%', 
                width: '100%',
                borderRadius: isLanding ? '0px' : '8px',
                overflow: 'hidden'
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {!isLanding && (
                <>
                    <MapViewHandler mapCenter={mapCenter} mapZoom={mapZoom} />
                    <MarkerLayer properties={properties} />
                    <GeoJsonBoundaryLayer activeDistrict={activeDistrict} />
                </>
            )}
            
        </MapContainer>
    );
};

export default UnifiedMap;