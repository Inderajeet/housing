import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Heart } from 'lucide-react'; 
import '../styles/PropertyListings.css'; 

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();

    // Format price to a readable string (e.g., 31.8 Lacs, 1.2 Cr)
    const formatPrice = (price) => {
        if (!price || price === 0) return 'Price on Request';
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
        return `₹${price.toLocaleString()}`;
    };

    const handleCardClick = () => {
        // Navigate to project details if it's a project, otherwise just stay
        navigate(`/project/${property.id}`); 
    };

    // Use a unique placeholder if no image is available
    const imageUrl = property.image || `https://placehold.co/200x160/2e62a9/ffffff?text=${property.title.split(' ')[0]}`;

    // Safely format price per sqft, falling back to 0 if not available
    const avgPriceDisplay = property.pricePerSqft 
        ? `₹${property.pricePerSqft.toLocaleString()} /sq.ft.`
        : 'N/A /sq.ft.';

    return (
        <div className="compact-property-card" onClick={handleCardClick}>
            
            {/* Left Image Section */}
            <div className="card-image-section">
                <img src={imageUrl} alt={property.title} className="card-thumbnail" onError={(e) => {
                    e.target.onerror = null; e.target.src="https://placehold.co/200x160/cccccc/333333?text=Image+Missing";
                }}/>
                {property.isNewLaunch && <span className="new-launch-badge">New Launch</span>}
                {property.isSeen && <span className="seen-badge">Seen</span>}
                <button className="favorite-button" onClick={(e) => e.stopPropagation()} title="Shortlist">
                    <Heart size={18} fill="#fff" strokeWidth={1.5} />
                </button>
            </div>

            {/* Right Details Section */}
            <div className="card-details-section">
                
                {/* Title and RERA Status */}
                <div className="title-row">
                    <h3 className="property-title">{property.title}</h3>
                    {/* RERA Verified Tag (Tick RERA) */}
                    {property.rera && (
                        <span className="rera-verified-tag">
                            <Check size={12} strokeWidth={3} className="rera-tick" /> RERA
                        </span>
                    )}
                </div>

                {/* BHK Details */}
                <p className="bhk-details-text">{property.bhk}</p>

                {/* Price and Area Range - Using property.minPrice and property.maxPrice if available */}
                <div className="price-area-container">
                    <div className="bhk-option">
                        <span className="bhk-type-label">2 BHK Flat</span>
                        {/* Fallback for minPrice and maxPrice just in case, using the single property.price if available */}
                        <span className="price-label">{formatPrice(property.minPrice || property.price || 0)} - {formatPrice(property.maxPrice || property.price || 0)}</span>
                    </div>
                    <div className="bhk-option">
                        <span className="bhk-type-label">3 BHK Flat</span>
                        <span className="price-label">{formatPrice((property.minPrice || property.price || 0) * 1.5)} - {formatPrice((property.maxPrice || property.price || 0) * 2)}</span>
                    </div>
                </div>

                {/* Avg Price and Possession */}
                <p className="extra-info">
                    Avg. Price: <span className="highlight-text">{avgPriceDisplay}</span> • Possession: {property.possessionDate || 'Immediate'}
                </p>

                <div className="developer-contact-row">
                    <div className="developer-info">
                        <span className="developer-name">{property.developer || 'Unknown Developer'}</span>
                        <span className="developer-projects"> +{property.projectsCount || 1} more</span>
                    </div>
                    <button
                        className="contact-button primary-purple"
                        onClick={(e) => { e.stopPropagation(); console.log(`Contacting for ${property.title}`); }}
                    >
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;