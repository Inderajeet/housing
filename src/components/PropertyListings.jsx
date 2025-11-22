// src/components/PropertyListings.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      .join(', ') || 'Chennai';

  const getSellerName = (p) => p.developer || p.seller_name || 'Owner';

  // Seller dropdown (side panel)
  const [selectedSeller, setSelectedSeller] = useState('ALL');

  const sellerOptions = useMemo(() => {
    const names = properties.map(getSellerName).filter(Boolean);
    return Array.from(new Set(names));
  }, [properties]);

  // Promoted properties (side panel)
  const promotedProperties = useMemo(
    () => properties.filter((p) => p.isPromoted),
    [properties]
  );

  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (promoIndex >= promotedProperties.length) {
      setPromoIndex(0);
    }
  }, [promotedProperties.length, promoIndex]);

  useEffect(() => {
    if (!isSidePanel) return;
    if (!promotedProperties.length) return;
    if (promotedProperties.length <= 1) return;

    const id = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promotedProperties.length);
    }, 4000);

    return () => clearInterval(id);
  }, [promotedProperties.length, isSidePanel]);

  // Display properties
  const displayedProperties = useMemo(() => {
    if (!isSidePanel) return properties;
    if (selectedSeller === 'ALL') return properties;
    return properties.filter((p) => getSellerName(p) === selectedSeller);
  }, [properties, isSidePanel, selectedSeller]);

  // No results (general)
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
            No properties matching your filters in {locationDisplayName}. Try
            adjusting your search criteria.
          </p>
          <button
            className="reset-filters-btn"
            onClick={() =>
              handleFilterChange({
                propertyType: '',
                bhk: [],
                minPrice: 0,
                maxPrice: 100000000,
              })
            }
          >
            Reset Key Filters
          </button>
        </div>
      </div>
    );
  }

  // No results (side panel)
  if (isSidePanel && displayedProperties.length === 0) {
    return <div className="no-properties">No properties found.</div>;
  }

  const containerClass = isSidePanel ? 'side-view' : 'general-view';

  return (
    <div className={`property-listings-container ${containerClass}`}>
      {/* GENERAL VIEW: Listing header/filter only */}
      {!isSidePanel && (
        <ListingFilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          totalCount={totalCount}
          locationDisplayName={locationDisplayName}
        />
      )}

      {/* SIDE PANEL: seller filter + sponsored strip */}
      {isSidePanel && (
        <>
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
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {promotedProperties.length > 0 && (
            <div
              className="promoted-strip"
              onClick={() => {
                const promo = promotedProperties[promoIndex];
                if (promo?.id) {
                  navigate(`/project/${promo.id}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
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
                      <span className="promoted-seller">by {sellerName}</span>
                    </div>
                    <div className="promoted-controls">
                      <button
                        type="button"
                        className="promoted-arrow"
                        onClick={(e) => {
                          e.stopPropagation(); // don't navigate
                          setPromoIndex((prev) =>
                            (prev - 1 + promotedProperties.length) %
                            promotedProperties.length
                          );
                        }}
                      >
                        ‹
                      </button>
                      <span className="promoted-index">
                        {promoIndex + 1}/{promotedProperties.length}
                      </span>
                      <button
                        type="button"
                        className="promoted-arrow"
                        onClick={(e) => {
                          e.stopPropagation(); // don't navigate
                          setPromoIndex(
                            (prev) =>
                              (prev + 1) % promotedProperties.length
                          );
                        }}
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

      {/* Normal property cards */}
      <div className="listings-grid-wrapper">
        {displayedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyListings;
