import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import ListingFilterBar from './ListingFilterBar';
import '../styles/PropertyListings.css';

// Updated to handle API fields: sale_price or rent_amount
const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Price on request';
  const n = Number(price);

  if (n >= 1_00_00_000) {
    return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (n >= 1_00_000) {
    return `₹${(n / 1_00_00_000).toFixed(2)} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
};

const PropertyListings = ({
  properties,
  totalCount,
  isSidePanel,
  filters = {},
  handleFilterChange = () => {},
}) => {
  const navigate = useNavigate();

  const locationDisplayName =
    [filters.village, filters.taluk, filters.district]
      .filter(Boolean)
      .join(', ') || 'Tamil Nadu';

  // DYNAMIC SELLER: Get from API fields
  const getSellerName = (p) => p.developer_name || p.seller_name || p.posted_by ;

  const [selectedSeller, setSelectedSeller] = useState('ALL');

  const sellerOptions = useMemo(() => {
    const names = properties.map(getSellerName).filter(Boolean);
    return Array.from(new Set(names));
  }, [properties]);

  // PROMOTED: Filtered from API property status
  const promotedProperties = useMemo(
    () => properties.filter((p) => p.is_promoted === 1 || p.isPromoted),
    [properties]
  );

  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (promoIndex >= promotedProperties.length) {
      setPromoIndex(0);
    }
  }, [promotedProperties.length, promoIndex]);

  useEffect(() => {
    if (!isSidePanel || promotedProperties.length <= 1) return;

    const id = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promotedProperties.length);
    }, 4000);

    return () => clearInterval(id);
  }, [promotedProperties.length, isSidePanel]);

  const displayedProperties = useMemo(() => {
    if (!isSidePanel || selectedSeller === 'ALL') return properties;
    return properties.filter((p) => getSellerName(p) === selectedSeller);
  }, [properties, isSidePanel, selectedSeller]);

  // Handle Empty State
  if (displayedProperties.length === 0) {
    return (
      <div className={isSidePanel ? "no-properties" : "general-listings-section full-width-section"}>
        {!isSidePanel && (
           <ListingFilterBar
            filters={filters}
            handleFilterChange={handleFilterChange}
            totalCount={0}
            locationDisplayName={locationDisplayName}
          />
        )}
        <div className="no-properties-general">
          <p>No properties found in {locationDisplayName}.</p>
          <button className="reset-filters-btn" onClick={() => handleFilterChange({ bhk: [], minPrice: 0, maxPrice: 100000000 })}>
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  const containerClass = isSidePanel ? 'side-view' : 'general-view';

  return (
    <div className={`property-listings-container ${containerClass}`}>
      {!isSidePanel && (
        <ListingFilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          totalCount={totalCount}
          locationDisplayName={locationDisplayName}
        />
      )}

      {isSidePanel && (
        <>
          {/* DYNAMIC SELLER FILTER */}
          {sellerOptions.length > 0 && (
            <div className="seller-filter-row">
              <span className="seller-filter-label">Sellers in this area:</span>
              <select
                className="seller-filter-select"
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
              >
                <option value="ALL">All sellers</option>
                {sellerOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          {/* DYNAMIC PROMOTED STRIP */}
          {promotedProperties.length > 0 && (
            <div
              className="promoted-strip"
              onClick={() => navigate(`/project/${promotedProperties[promoIndex].property_id}`)}
              style={{ cursor: 'pointer' }}
            >
              {(() => {
                const promo = promotedProperties[promoIndex] || {};
                const loc = [promo.village_name, promo.district_name].filter(Boolean).join(', ');
                const priceValue = promo.sale_price || promo.rent_amount;

                return (
                  <>
                    <span className="promoted-label">Sponsored</span>
                    <div className="promoted-main">
                      <span className="promoted-title">{promo.property_name || promo.title || 'Featured Project'}</span>
                      <span className="promoted-meta">
                        {loc} • {formatPrice(priceValue)}
                      </span>
                      <span className="promoted-seller">by {getSellerName(promo)}</span>
                    </div>
                    <div className="promoted-controls">
                      <button type="button" className="promoted-arrow" onClick={(e) => { e.stopPropagation(); setPromoIndex(prev => (prev - 1 + promotedProperties.length) % promotedProperties.length); }}>‹</button>
                      <span className="promoted-index">{promoIndex + 1}/{promotedProperties.length}</span>
                      <button type="button" className="promoted-arrow" onClick={(e) => { e.stopPropagation(); setPromoIndex(prev => (prev + 1) % promotedProperties.length); }}>›</button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* RENDER GRID */}
      <div className="listings-grid-wrapper">
        {displayedProperties.map((property) => (
          <PropertyCard 
            key={property.property_id || property.id} 
            property={property} 
            // Passing down dynamic data from API
            dynamicBHK={property.bhk} 
            dynamicType={property.property_type}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyListings;