import React from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';

const ProjectMap = ({ project, aroundRef }) => {
    const { title, location } = project;
    
    // Using simple iframe or static image link for OpenStreetMaps placeholder
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.005}%2C${location.lat - 0.005}%2C${location.lng + 0.005}%2C${location.lat + 0.005}&layer=mapnik&marker=${location.lat}%2C${location.lng}`;

    return (
        <div className="section" ref={aroundRef}>
            <h2>🗺️ Explore Neighborhood</h2>
            <p>View the location of **{title}** ({project.village}) on the map.</p>
            
            <div className="map-container-placeholder">
                {/* In a real React app, you would use a library like 'react-leaflet' 
                  to render a functional OpenStreetMap widget here. 
                  For now, we use an iframe placeholder for simplicity.
                */}
                <iframe 
                    width="100%" 
                    height="400" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={mapUrl}
                    title={`Map of ${title} in ${project.village}`}
                ></iframe>
                <small>
                    <a href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`} target="_blank" rel="noopener noreferrer">
                        <FaMapMarkedAlt /> View larger map on OpenStreetMap
                    </a>
                </small>
            </div>
        </div>
    );
};

export default ProjectMap;