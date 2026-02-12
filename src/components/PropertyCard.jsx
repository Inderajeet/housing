import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/PropertyListings.css';

const PropertyCard = ({ property }) => {
    const navigate = useNavigate();
    const [imgIndex, setImgIndex] = useState(0);

    const isRent = !!property.rent_amount;

    const images = property.images || [];
    const hasImages = images.length > 0;
    const placeholder = `https://placehold.co/300x200/2e62a9/ffffff?text=${property.formatted_id || 'Property'}`;

    const formatPrice = (price) => {
        if (!price || price === 0) return 'Price on Request';
        const n = Number(price);
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
        return `₹${n.toLocaleString('en-IN')}`;
    };

    const nextImg = (e) => {
        e.stopPropagation();
        setImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImg = (e) => {
        e.stopPropagation();
        setImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleCardClick = () => {
        navigate(`/property/${property.property_id}`, {
            state: { propertyData: property }
        });
    };

    const capitalizeFirst = (value) => {
        if (!value || typeof value !== 'string') return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const saleTypeLabel = capitalizeFirst(property.sale_type);
    const titleText = isRent
        ? `${property.bhk} BHK ${property.property_use || property.property_type}`
        : [property.area_size, saleTypeLabel].filter(Boolean).join(' ');

    return (
        <div className="compact-property-card" onClick={handleCardClick}>
            {/* IMAGE */}
            <div className="card-image-section">
                <img
                    src={hasImages ? images[imgIndex].url : placeholder}
                    alt={property.formatted_id}
                    className="card-thumbnail"
                />

                {images.length > 1 && (
                    <>
                        <button className="slider-nav prev" onClick={prevImg}>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="slider-nav next" onClick={nextImg}>
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}

                <button className="favorite-button" onClick={(e) => e.stopPropagation()}>
                    <Heart size={18} />
                </button>
            </div>

            {/* DETAILS */}
            <div className="card-details-section">
                <p className="bhk-details-text">
                    {titleText}
                </p>

                {/* PRICE */}
                <div className="price-area-container">
                    <span className="price-label">
                        {isRent
                            ? `${formatPrice(property.rent_amount)} / month`
                            : `Expected Price: ${formatPrice(property.sale_price)}`}
                    </span>

                    {isRent && property.advance_amount && (
                        <span className="advance-label">
                            Advance: {formatPrice(property.advance_amount)}
                        </span>
                    )}
                </div>

                <p className="extra-info">
                    <MapPin size={12} /> {property.district_name}
                    {property.seller_name && ` • Seller: ${property.seller_name}`}
                </p>

                <div className="developer-contact-row">
                    <button className="contact-button primary-purple" onClick={(e) => e.stopPropagation()}>
                        Contact Seller
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
