import React, { useMemo, useCallback } from 'react';
import FilterPanel from './FilterPanel';
import PropertyListings from './PropertyListings';
import FreeMap from './FreeMap';
import TopPicksSlider from './TopPicksSlider';
import { Search } from 'lucide-react'; // Import the search icon

// IMPORTANT: This component only handles UI and presentation, 
// all state (filters, properties) and handlers come from props.

const HomePageContent = ({
  filters,
  handleFilterChange,
  filteredProperties,
  topPicks,
  locationData,
  showFilterPanel,
  setShowFilterPanel,
  showListingsPanel,
  setShowListingsPanel,
}) => {

  // --- Location Utilities (using LOCATION_DATA from props/App) ---
  const getTaluks = useCallback((district) => {
    return locationData[district] ? Object.keys(locationData[district]) : [];
  }, [locationData]);

  const getVillages = useCallback((district, taluk) => {
    return locationData[district] && locationData[district][taluk] ? locationData[district][taluk] : [];
  }, [locationData]);

  // --- Map Centering and Zoom Logic ---
  const { mapCenter, mapZoom } = useMemo(() => {
    let center = [13.0827, 80.2707]; // Default Chennai center
    let zoom = 11;

    if (filters.district) {
      zoom = 12;
    }
    if (filters.taluk) {
      zoom = 13;
    }
    if (filters.village) {
      zoom = 14;
    }

    if (filteredProperties.length > 0) {
      const latSum = filteredProperties.reduce((sum, p) => sum + p.location.lat, 0);
      const lngSum = filteredProperties.reduce((sum, p) => sum + p.location.lng, 0);
      center = [latSum / filteredProperties.length, lngSum / filteredProperties.length];
    }

    return { mapCenter: center, mapZoom: zoom };
  }, [filteredProperties, filters.district, filters.taluk, filters.village]);

  const filterPanelClass = `floating-filter-panel ${showFilterPanel ? 'expanded' : 'minimized'} ${filters.showAdvanced ? 'advanced-active' : 'basic-active'}`;

  // --- Dynamic Header for Listings ---
  const getListingHeader = () => {
    const location = [filters.village, filters.taluk, filters.district].filter(Boolean).join(', ');
    return location ? `All ${filteredProperties.length} Properties in ${location}` : `All ${filteredProperties.length} Properties in Tamil Nadu`;
  };

  return (
    <div className="home-container">

      {/* 1. Main Map Content Area */}
      <div className="main-map-area">

        {/* --- FLOATING FILTER PANEL (LEFT) --- */}
        <div className={filterPanelClass}>

          {showFilterPanel ? (
            <>
              {/* --- BASIC LOCATION SEARCH BAR (New Implementation) --- */}
              <div className={`basic-filter-section ${filters.showAdvanced ? 'hidden' : 'visible'}`}>

                {/* Simplified Search Bar (Like Housing.com/NoBroker) */}
                <div className="search-bar-group">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Enter Location, Project, or Landmark"
                    // In a real app, this would be an auto-suggest/geocoding input
                    // For now, we'll map the current filters to show location context
                    value={[filters.village, filters.taluk, filters.district].filter(Boolean).join(', ')}
                    readOnly
                    onClick={() => handleFilterChange({ showAdvanced: true })} // Opens the filter panel
                  />
                  <button
                    className="see-all-filters-btn"
                    onClick={() => handleFilterChange({ showAdvanced: true })}
                  >
                    See All Filters
                  </button>
                </div>

              </div>

              {/* --- ADVANCED FILTER MODAL --- */}
              {filters.showAdvanced && (
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onApply={handleFilterChange}
                  onClose={() => handleFilterChange({ showAdvanced: false })}
                  isModal={true}
                  locationData={locationData} // Pass location data to the panel if needed
                  getTaluks={getTaluks} // Pass utilities
                  getVillages={getVillages}
                />
              )}
            </>
          ) : (
            // Minimized Toggle Button
            <button
              className="minimize-toggle-btn"
              onClick={() => setShowFilterPanel(true)}
              title="Show Filters"
            >
              🔍
            </button>
          )}
        </div>

        {/* The Map */}
        <div className="map-container">
          <FreeMap
            properties={filteredProperties}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            activeDistrict={filters.district}
          />
          <div className="map-controls-overlay">
            <div style={{
              fontSize: '14px', color: '#3498db', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <span role="img" aria-label="pointer">👇</span> Now search in nearby areas by selecting them directly on the map
            </div>
          </div>
        </div>

        {/* --- FLOATING LISTINGS PANEL (RIGHT) --- */}
        <div className={`floating-listings-panel ${showListingsPanel ? 'expanded' : 'minimized'}`}>

          {showListingsPanel ? (
            // Expanded Content
            <>
              <div className="panel-header">
                <span className="listing-count-header">{filteredProperties.length}+ Properties Without Brokerage found</span>
                <button className="close-btn" onClick={() => setShowListingsPanel(false)}>✕</button>
              </div>
              <PropertyListings
                properties={filteredProperties.slice(0, 5)} // Show top 5 in side panel
                totalCount={filteredProperties.length}
                isSidePanel={true}
              />
            </>
          ) : (
            // Minimized Toggle Button
            <button
              className="minimize-toggle-btn"
              onClick={() => setShowListingsPanel(true)}
              title="Show Listings"
            >
              🏠 ({filteredProperties.length})
            </button>
          )}
        </div>
      </div>

      {/* --- SECTIONS BELOW THE MAP --- */}

      <div className="top-picks-section full-width-section">
        <h2 className="section-header">Top Projects for You</h2>
        <TopPicksSlider topPicks={topPicks} />
      </div>

      <div className="general-listings-section full-width-section">
        <h2 className="section-header">{getListingHeader()}</h2>
        <PropertyListings
          properties={filteredProperties}
          totalCount={filteredProperties.length}
          isSidePanel={false} // General View (Stacked)
        />
      </div>

    </div>
  );
};

export default HomePageContent;