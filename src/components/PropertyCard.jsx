import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PropertyListings.css';

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/property/${property.property_id}`, {
            state: { propertyData: property }
        });
    };

    return (
        <div className="compact-property-card" onClick={handleCardClick}>
            <div className="card-details-section">
                <div className="title-row">
                    <p className="property-title">{property.formatted_id || 'Property'}</p>
                    {property.title ? <p className="bhk-details-text">{property.title}</p> : null}
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
