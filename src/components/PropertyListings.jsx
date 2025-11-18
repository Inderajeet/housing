import React from 'react';
import PropertyCard from './PropertyCard';
import ListingFilterBar from './ListingFilterBar'; 
import '../styles/PropertyListings.css'; 

// Main Property Listings Component
const PropertyListings = ({
    properties,
    totalCount,
    isSidePanel,
    // Add filters and handler here to receive them from parent
    filters = {},
    handleFilterChange = () => {}
}) => {
    // Determine the display name for the location
    const locationDisplayName = [filters.village, filters.taluk, filters.district].filter(Boolean).join(', ') || 'Chennai';

    // Handle case where no properties match filters for the *general view*
    if (properties.length === 0 && !isSidePanel) {
        return (
            <div className="general-listings-section full-width-section">
                <ListingFilterBar
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    totalCount={totalCount}
                    locationDisplayName={locationDisplayName}
                />
                <div className="no-properties-general">
                    <p>No properties matching your filters in {locationDisplayName}. Try adjusting your search criteria.</p>
                    {/* Assuming default max price is 100M (10 Cr) */}
                    <button className="reset-filters-btn" onClick={() => handleFilterChange({ propertyType: '', bhk: [], minPrice: 0, maxPrice: 100000000 })}>
                        Reset Key Filters
                    </button>
                </div>
            </div>
        );
    }
    // Handle case where no properties match for the *side panel view*
    if (properties.length === 0 && isSidePanel) {
        return <div className="no-properties">No properties found.</div>;
    }

    const containerClass = isSidePanel ? 'side-view' : 'general-view';

    // Header for the side panel view (simple)
    const sidePanelHeader = isSidePanel && (
        <div className="property-count-header">
            {totalCount}+ Properties Found in {locationDisplayName}
        </div>
    );
    
    return (
        <div className={`property-listings-container ${containerClass}`}>
            {sidePanelHeader}

            {/* Conditional Listing Header/Filters - Render ListingFilterBar only for general view */}
            {!isSidePanel && (
                <ListingFilterBar
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    totalCount={totalCount}
                    locationDisplayName={locationDisplayName}
                />
            )}

            {/* The listings grid wrapper */}
            <div className="listings-grid-wrapper">
                {properties.map(property => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                    />
                ))}
            </div>
        </div>
    );
};

export default PropertyListings;