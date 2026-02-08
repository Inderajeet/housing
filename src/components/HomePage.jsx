// src/components/HomePage.jsx

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedMap from './UnifiedMap';
import FilterPanel from '../components/FilterPanel';
import PropertyListings from '../components/PropertyListings';
import TopPicksSlider from '../components/TopPicksSlider';
import '../styles/HomePage.css';

// Mock Location Data Structure
const LOCATION_DATA = {
  Chennai: {
    'Taluk A (North)': ['T. Nagar', 'Mylapore', 'Anna Nagar', 'Tambaram'],
    'Taluk B (South)': ['Velachery', 'Tambaram', 'Perungudi'],
  },
  Coimbatore: {
    'Taluk C (East)': ['Gopalapuram', 'Ramanathapuram'],
    'Taluk D (West)': ['Kuniamuthur'],
  },
  'Tamil Nadu': {},
};

// Utility function to mock location detection from query
const parseQueryToFilters = (query) => {
  const lowerQuery = query.toLowerCase();
  const newFilters = { district: '', taluk: '', village: '' };

  for (const [district, taluks] of Object.entries(LOCATION_DATA)) {
    for (const [taluk, villages] of Object.entries(taluks)) {
      for (const village of villages) {
        if (lowerQuery.includes(village.toLowerCase())) {
          newFilters.district = district;
          newFilters.taluk = taluk;
          newFilters.village = village;
          return newFilters;
        }
      }

      if (lowerQuery.includes(taluk.toLowerCase().split(' ')[0])) {
        if (!newFilters.village) {
          newFilters.taluk = taluk;
          newFilters.district = district;
        }
      }
    }

    if (lowerQuery.includes(district.toLowerCase())) {
      if (!newFilters.district) {
        newFilters.district = district;
      }
    }
  }

  if (!newFilters.district) {
    if (lowerQuery.includes('chennai')) {
      newFilters.district = 'Chennai';
    } else if (lowerQuery.includes('coimbatore')) {
      newFilters.district = 'Coimbatore';
    }
  }

  return newFilters;
};

// Utility function to get predefined coordinates for map centering
const getPredefinedCenter = (locationKey) => {
  const TN_DEFAULT_CENTER = [10.7905, 78.7047];

  if (locationKey === 'Chennai') return [13.0827, 80.2707];
  if (locationKey === 'Coimbatore') return [11.0168, 76.9558];

  return TN_DEFAULT_CENTER;
};

const HomePage = () => {
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

  // Define default filters
  const defaultFilters = {
    state: 'TN',
    district: '',
    taluk: '',
    village: '',
    propertyType: 'Apartment',
    lookingTo: 'Rent',
    minPrice: 0,
    maxPrice: 100000000,
    bhk: [],
    showAdvanced: false,
  };

  const [filters, setFilters] = useState(defaultFilters);

  const [allProperties, setAllProperties] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Check if mobile on initial load
  const [showListingsPanel, setShowListingsPanel] = useState(() => {
    // Default to false (collapsed) on mobile, true on desktop
    return window.innerWidth > 768;
  });

  // Optional: Update listings panel state on window resize
  useEffect(() => {
    const handleResize = () => {
      // Only auto-expand on desktop if currently collapsed
      if (window.innerWidth > 768 && !showListingsPanel) {
        setShowListingsPanel(true);
      }
      // Auto-collapse on mobile if currently expanded
      if (window.innerWidth <= 768 && showListingsPanel) {
        setShowListingsPanel(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showListingsPanel]);

  // --- Initial Filter Application ---
  useEffect(() => {
    if (location.state && location.state.initialQuery) {
      const query = location.state.initialQuery;
      const initialLocationFilters = parseQueryToFilters(query);

      setFilters(prev => ({
        ...prev,
        ...initialLocationFilters,
      }));
    }
    else if (location.state && location.state.initialFilters) {
      const { propertyType, lookingTo, bhk } = location.state.initialFilters;

      setFilters(prev => ({
        ...prev,
        propertyType: propertyType || prev.propertyType,
        lookingTo: lookingTo || prev.lookingTo,
        bhk: bhk ? [bhk] : [],
      }));
    }
  }, [location.state]);

  // --- Mock Data Fetching (API Simulation) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const propertiesResponse = await fetch(`${API_BASE_URL}/api/properties`);
        if (!propertiesResponse.ok) {
          throw new Error(`HTTP error! status: ${propertiesResponse.status} for /api/properties`);
        }
        const propertiesData = await propertiesResponse.json();

        setAllProperties(propertiesData || []);

        const topPicksResponse = await fetch('/data/topPicks.json');
        let topPicksData = { topPicks: [] };
        if (topPicksResponse.ok) {
          topPicksData = await topPicksResponse.json();
        } else {
          console.warn("topPicks.json not found, using empty array for Top Picks.");
        }

        setTopPicks(topPicksData.topPicks || []);
      } catch (error) {
        console.error("Could not fetch data:", error);
        setAllProperties([]);
        setTopPicks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- Filtering Logic ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      const districtMatch = !filters.district || property.district === filters.district;
      const talukMatch = !filters.taluk || property.taluk === filters.taluk;
      const villageMatch = !filters.village || property.village === filters.village;

      let typeMatch = true;
      if (filters.propertyType) {
        const typeFilter = filters.propertyType.toLowerCase().replace(/\s/g, '');
        const propertyType = property.type.toLowerCase().replace(/\s/g, '');

        if (typeFilter === 'standalonebuilding' || typeFilter === 'house') {
          typeMatch = propertyType.includes('independenthouse') || propertyType.includes('house');
        } else if (typeFilter === 'apartment' || typeFilter === 'flat' || typeFilter === 'gatedcommunity') {
          typeMatch = propertyType.includes('apartment') || propertyType.includes('flat') || propertyType.includes('gatedcommunity');
        } else {
          typeMatch = propertyType.includes(typeFilter);
        }
      }

      let bhkMatch = true;
      if (filters.bhk.length > 0) {
        const propertyBhkValue = property.bhk.includes('BHK') ? parseInt(property.bhk.split(' ')[0]) : property.bhk;

        bhkMatch = filters.bhk.some(bhkFilter => {
          const bhkFilterString = String(bhkFilter);

          if (bhkFilterString === '4+ BHK') return parseInt(propertyBhkValue) >= 4;
          if (bhkFilterString === '3+ BHK') return parseInt(propertyBhkValue) >= 3;
          if (bhkFilterString === '1 RK') return propertyBhkValue === 1 || propertyBhkValue === '1';

          if (bhkFilterString.includes('BHK')) {
            return propertyBhkValue === parseInt(bhkFilterString.split(' ')[0]);
          }
          return propertyBhkValue === parseInt(bhkFilterString);
        });
      }

      const priceMatch = (property.price || 0) >= filters.minPrice &&
        (property.price || 0) <= filters.maxPrice;

      return districtMatch && talukMatch && villageMatch && typeMatch && bhkMatch && priceMatch;
    });
  }, [filters, allProperties]);

  // --- Filter Handlers and Utilities ---
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getTaluks = useCallback((district) => {
    return LOCATION_DATA[district] ? Object.keys(LOCATION_DATA[district]) : [];
  }, []);

  const getVillages = useCallback((district, taluk) => {
    return LOCATION_DATA[district] && LOCATION_DATA[district][taluk] ? LOCATION_DATA[district][taluk] : [];
  }, []);

  // --- Map Centering and Zoom Logic ---
  const { mapCenter, mapZoom } = useMemo(() => {
    const TN_DEFAULT_CENTER = getPredefinedCenter('Tamil Nadu');
    const TN_DEFAULT_ZOOM = 7;

    let center = TN_DEFAULT_CENTER;
    let zoom = TN_DEFAULT_ZOOM;

    if (filters.district) {
      zoom = 12;
    }
    if (filters.taluk) {
      zoom = 13;
    }
    if (filters.village) {
      zoom = 14;
    }

    const hasSpecificLocationFilter = filters.taluk || filters.village;
    const hasFilteredProperties = filteredProperties.length > 0;

    if (hasFilteredProperties && hasSpecificLocationFilter) {
      const validProperties = filteredProperties.filter(p => p.location?.lat && p.location?.lng);

      if (validProperties.length > 0) {
        const latSum = validProperties.reduce((sum, p) => sum + p.location.lat, 0);
        const lngSum = validProperties.reduce((sum, p) => sum + p.location.lng, 0);
        center = [latSum / validProperties.length, lngSum / validProperties.length];
      }
    }
    else if (filters.district) {
      center = getPredefinedCenter(filters.district);
    }

    return { mapCenter: center, mapZoom: zoom };
  }, [filteredProperties, filters.district, filters.taluk, filters.village]);

  // --- Component Rendering ---
  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  const filterPanelClass = `floating-filter-panel ${showFilterPanel ? 'expanded' : 'minimized'} ${filters.showAdvanced ? 'advanced-active' : 'basic-active'}`;

  return (
    <div className="home-container">
      {/* Main Map Content Area */}
      <div className="main-map-area">

        {/* --- FLOATING FILTER PANEL (LEFT) --- */}
        <div className={filterPanelClass}>
          {showFilterPanel ? (
            <>
              <div className={`basic-filter-section ${filters.showAdvanced ? 'hidden' : 'visible'}`}>
                <div className="location-filter-group">
                  <select
                    value={filters.district}
                    onChange={(e) => handleFilterChange({ district: e.target.value, taluk: '', village: '' })}
                  >
                    <option value="">Select District</option>
                    {Object.keys(LOCATION_DATA).filter(d => d !== 'Tamil Nadu').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={filters.taluk}
                    onChange={(e) => handleFilterChange({ taluk: e.target.value, village: '' })}
                    disabled={!filters.district}
                  >
                    <option value="">Select Taluk</option>
                    {getTaluks(filters.district).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="location-filter-group bottom-row">
                  <select
                    value={filters.village}
                    onChange={(e) => handleFilterChange({ village: e.target.value })}
                    disabled={!filters.taluk}
                  >
                    <option value="">Select Village/Area</option>
                    {getVillages(filters.district, filters.taluk).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>

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
                  onApply={setFilters}
                  onClose={() => handleFilterChange({ showAdvanced: false })}
                  isModal={true}
                />
              )}
            </>
          ) : (
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
          <UnifiedMap
            mode="home"
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
            <>
              <div className="panel-header">
                <span className="listing-count-header">{filteredProperties.length}+ Properties found</span>
                <button className="close-btn" onClick={() => setShowListingsPanel(false)}>✕</button>
              </div>
              <PropertyListings
                properties={filteredProperties}
                totalCount={filteredProperties.length}
                isSidePanel={true}
              />
            </>
          ) : (
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
        <h2 className="section-header section-header1">All {filteredProperties.length} Properties in {filters.district || 'Tamil Nadu'}</h2>
        <PropertyListings
          properties={filteredProperties}
          totalCount={filteredProperties.length}
          isSidePanel={false}
          filters={filters}
          handleFilterChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

export default HomePage;