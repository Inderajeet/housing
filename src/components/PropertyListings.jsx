// src/components/PropertyListings.jsx
import React, { useState, useMemo, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import ListingFilterBar from './ListingFilterBar'; 
import '../styles/PropertyListings.css'; 

const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'Price on request';
  const n = Number(price);

  if (n >= 1_00_00_000) {
    return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (n >= 1_00_000) {
    return `₹${(n / 1_00_000).toFixed(2)} L`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
};

// Main Property Listings Component
const PropertyListings = ({
  properties,
  totalCount,
  isSidePanel,
  filters = {},
  handleFilterChange = () => {},
}) => {
  // 🧭 Common location name (used for messages)
  const locationDisplayName =
    [filters.village, filters.taluk, filters.district]
      .filter(Boolean)
      .join(', ') || 'Chennai';

  // 👤 Helper to get seller name
  const getSellerName = (p) =>
    p.developer || p.seller_name || 'Owner';

  // 🔽 Seller dropdown state (only used in general view, but hooks must be top-level)
  const [selectedSeller, setSelectedSeller] = useState('ALL');

  // Unique sellers for the dropdown (based on already-filtered properties)
  const sellerOptions = useMemo(() => {
    const names = properties.map(getSellerName).filter(Boolean);
    return Array.from(new Set(names));
  }, [properties]);

  // 🔁 Promoted properties (for mini slider)
  const promotedProperties = useMemo(
    () => properties.filter((p) => p.isPromoted),
    [properties]
  );

  const [promoIndex, setPromoIndex] = useState(0);

  // Reset promo index when list changes
  useEffect(() => {
    if (promoIndex >= promotedProperties.length) {
      setPromoIndex(0);
    }
  }, [promotedProperties.length, promoIndex]);

  // Auto-rotate promoted slider
  useEffect(() => {
    if (!promotedProperties.length || isSidePanel) return;
    if (promotedProperties.length <= 1) return;

    const id = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promotedProperties.length);
    }, 4000);

    return () => clearInterval(id);
  }, [promotedProperties.length, isSidePanel]);

  // 👉 Properties actually displayed (seller filter only in general view)
  const displayedProperties = useMemo(() => {
    if (isSidePanel) return properties;
    if (selectedSeller === 'ALL') return properties;
    return properties.filter(
      (p) => getSellerName(p) === selectedSeller
    );
  }, [properties, isSidePanel, selectedSeller]);

  // ⚠️ No results cases
  // General view: check displayedProperties (respect seller filter)
  if (!isSidePanel && displayedProperties.length === 0) {
    return (
      <div className="general-listings-section full-width-section">
        <ListingFilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          totalCount={totalCount}
          locationDisplayName={locationDisplayName}
        />
        <div className="no-properties-general">
          <p>
            No properties matching your filters in {locationDisplayName}.
            Try adjusting your search criteria.
          </p>
          <button
            className="reset-filters-btn"
            onClick={() =>
              handleFilterChange({
                propertyType: '',
                bhk: [],
                minPrice: 0,
                maxPrice: 100000000, // 10 Cr
              })
            }
          >
            Reset Key Filters
          </button>
        </div>
      </div>
    );
  }

  // Side panel: just use original properties
  if (isSidePanel && properties.length === 0) {
    return <div className="no-properties">No properties found.</div>;
  }

  const containerClass = isSidePanel ? 'side-view' : 'general-view';

  return (
    <div className={`property-listings-container ${containerClass}`}>
      {/* ✅ No extra header for side panel to avoid duplicate count */}

      {/* ListingFilterBar only for general view */}
      {!isSidePanel && (
        <>
          <ListingFilterBar
            filters={filters}
            handleFilterChange={handleFilterChange}
            totalCount={totalCount}
            locationDisplayName={locationDisplayName}
          />

          {/* 👤 Seller dropdown row (under count area) */}
          {sellerOptions.length > 0 && (
            <div className="seller-filter-row">
              <span className="seller-filter-label">
                {totalCount}+ properties from
              </span>
              <select
                className="seller-filter-select"
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
              >
                <option value="ALL">All sellers</option>
                {sellerOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 🔥 Mini promoted slider (one line strip) */}
          {promotedProperties.length > 0 && (
            <div className="promoted-strip">
              {(() => {
                const promo = promotedProperties[promoIndex] || {};
                const sellerName = getSellerName(promo);
                const locParts = [];
                if (promo.village) locParts.push(promo.village);
                if (promo.district) locParts.push(promo.district);

                return (
                  <>
                    <span className="promoted-label">Sponsored</span>
                    <div className="promoted-main">
                      <span className="promoted-title">
                        {promo.title || 'Featured property'}
                      </span>
                      <span className="promoted-meta">
                        {locParts.join(', ') || 'Location'} •{' '}
                        {formatPrice(promo.price)}
                      </span>
                      <span className="promoted-seller">
                        by {sellerName}
                      </span>
                    </div>
                    <div className="promoted-controls">
                      <button
                        type="button"
                        className="promoted-arrow"
                        onClick={() =>
                          setPromoIndex((prev) =>
                            (prev - 1 + promotedProperties.length) %
                            promotedProperties.length
                          )
                        }
                      >
                        ‹
                      </button>
                      <span className="promoted-index">
                        {promoIndex + 1}/{promotedProperties.length}
                      </span>
                      <button
                        type="button"
                        className="promoted-arrow"
                        onClick={() =>
                          setPromoIndex(
                            (prev) =>
                              (prev + 1) % promotedProperties.length
                          )
                        }
                      >
                        ›
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* The listings grid wrapper */}
      <div className="listings-grid-wrapper">
        {displayedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyListings;
