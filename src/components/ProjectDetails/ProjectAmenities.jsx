import React from 'react';
import { FaSwimmer, FaDumbbell, FaChild, FaShieldAlt, FaBuilding } from 'react-icons/fa';
import { IoIosPeople } from 'react-icons/io';

const iconMap = {
    'Gymnasium': FaDumbbell,
    'Swimming Pool': FaSwimmer,
    'Children Play Area': FaChild,
    '24/7 Security': FaShieldAlt,
    'Community Hall': IoIosPeople,
    'Clubhouse': IoIosPeople,
    // Add more mappings as needed for other amenities
};

const ProjectAmenities = ({ amenities, amenityRef }) => {
    if (!amenities || amenities.length === 0) return null;

    return (
        <div className="section" ref={amenityRef}>
            <h2>✨ Project Amenities</h2>
            <div className="amenity-list">
                {amenities.map(a => {
                    const Icon = iconMap[a] || FaBuilding; // Default icon
                    return (
                        <span key={a} className="amenity-tag">
                            <Icon /> {a}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectAmenities;