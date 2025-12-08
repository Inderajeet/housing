import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Mock Location Data Structure (copied from HomePage for context)
// NOTE: These centers are rough estimates for demonstration.
const LOCATION_DATA = {
  Chennai: { 
    center: [13.0827, 80.2707], // Center of Chennai
    zoom: 12,
  },
  Coimbatore: { 
    center: [11.0168, 76.9558], // Center of Coimbatore
    zoom: 12,
  },
  'Tamil Nadu': {
    center: [10.7905, 78.7047], // Center of Tamil Nadu
    zoom: 7,
  }
};

// --- Sub-Component 1: Handles Map View (Center/Zoom) ---
const MapViewHandler = React.memo(({ mapCenter, mapZoom }) => {
    const map = useMap();
    React.useEffect(() => {
        // Use flyTo to smoothly transition to the new center/zoom
        map.flyTo(mapCenter, mapZoom, {
            duration: 0.8 
        });
    }, [map, mapCenter, mapZoom]);
    return null;
});

// --- Sub-Component 2: Handles Markers (Home Mode only) ---
const MarkerLayer = React.memo(({ properties }) => {
    // ... (logic unchanged) ...
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
    
    // Mapping districts to their GeoJSON file paths
    const GEOJSON_PATHS = {
        'Chennai': '/data/chennai_district.json',
        // Add other district paths here
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
                if (!response.ok) {
                    console.warn(`GeoJSON file not found for ${activeDistrict}: ${geoJsonPath}`);
                    return; 
                }

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
    }, [geoJsonPath, map, activeDistrict]); // Added activeDistrict to dependency array

    return null;
});


// --- Unified Map Component ---
const UnifiedMap = ({ 
    mode = 'landing',
    properties = [], 
    mapCenter, // Removed default values here
    mapZoom,   // Removed default values here
    activeDistrict = '' 
}) => {
    
    const isLanding = mode === 'landing';
    
    // Default to TN center/zoom if center/zoom props are not explicitly set
    const TN_CENTER = LOCATION_DATA['Tamil Nadu'].center;
    const TN_ZOOM = LOCATION_DATA['Tamil Nadu'].zoom;

    const initialCenter = mapCenter || TN_CENTER;
    const initialZoom = mapZoom || TN_ZOOM;
    
    // In landing mode, we always want the TN center and a fixed zoom (7)
    const mapProps = isLanding ? {
        center: TN_CENTER,
        zoom: TN_ZOOM,
        scrollWheelZoom: false,
        attributionControl: false,
    } : {
        // In home mode, use the calculated props for the initial load
        center: initialCenter,
        zoom: initialZoom,
        scrollWheelZoom: true,
        attributionControl: true,
    };

    // Use unique key to force React to unmount/remount when mode changes
    const containerKey = `${mode}-map-${activeDistrict}`;

    return (
        <MapContainer 
            key={containerKey}
            {...mapProps} // Apply all map properties
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
                    {/* MapViewHandler ensures the map updates when mapCenter/mapZoom change 
                        due to a new filter selection. We pass the calculated center/zoom 
                        from HomePage here. */}
                    <MapViewHandler mapCenter={initialCenter} mapZoom={initialZoom} />
                    <MarkerLayer properties={properties} />
                    <GeoJsonBoundaryLayer activeDistrict={activeDistrict} />
                </>
            )}
            
        </MapContainer>
    );
};

export default UnifiedMap;