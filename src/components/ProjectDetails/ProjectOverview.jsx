import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaKey } from 'react-icons/fa';

const ProjectOverview = ({ project, overviewRef }) => {
    const { title, area, bhk, developer, possession, reraCertified, overview, district } = project;

    return (
        <div className="section" ref={overviewRef}>
            <h2>🏡 {title} Overview</h2>
            <p>{overview}</p>
            <div className="property-summary">
                <div>
                    <label><FaRulerCombined /> Sizes</label> {area} sq. ft.
                </div>
                <div>
                    <label><FaBuilding /> Configurations</label> {bhk}
                </div>
                <div>
                    <label><FaMapMarkerAlt /> Location</label> {project.village}, {district}
                </div>
                <div>
                    <label><FaKey /> Possession</label> {possession}
                </div>
                {reraCertified && (
                    <div className="rera-badge">
                        <label>RERA</label> Certified
                    </div>
                )}
            </div>
            {/* Added for 'Around This Project' section */}
            <div className="section-sub">
                <h3>📍 Around This Project</h3>
                <div className="around-list">
                    {project.around && project.around.map((item, index) => (
                        <div key={index} className="around-item">
                            <strong>{item.name}</strong> ({item.type}) - {item.distance}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;