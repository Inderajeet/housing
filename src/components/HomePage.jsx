import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedMap from './UnifiedMap'; // <-- Use UnifiedMap
// DUMMY IMPORTS (Assuming these are defined elsewhere for the app to run)
import FilterPanel from '../components/FilterPanel';
import PropertyListings from '../components/PropertyListings';
import TopPicksSlider from '../components/TopPicksSlider';
import '../styles/HomePage.css';

// Mock Location Data Structure
const LOCATION_DATA = {
  Chennai: {
    'Taluk A (North)': ['T. Nagar', 'Mylapore', 'Anna Nagar', 'Tambaram'], // <-- Added Tambaram here
    'Taluk B (South)': ['Velachery', 'Tambaram', 'Perungudi'],
  },
  Coimbatore: {
    'Taluk C (East)': ['Gopalapuram', 'Ramanathapuram'],
    'Taluk D (West)': ['Kuniamuthur'],
  },
};

// Utility function to mock location detection from query
const parseQueryToFilters = (query) => {
  const lowerQuery = query.toLowerCase();
  const newFilters = { district: '', taluk: '', village: '' };

  // --- New Logic: Iterate through all locations to find the most specific match ---
  for (const [district, taluks] of Object.entries(LOCATION_DATA)) {
    for (const [taluk, villages] of Object.entries(taluks)) {

      // 1. Check for Village/Area Match (most specific)
      for (const village of villages) {
        if (lowerQuery.includes(village.toLowerCase())) {
          newFilters.district = district;
          newFilters.taluk = taluk;
          newFilters.village = village;
          return newFilters; // Found the most specific match, return immediately
        }
      }

      // 2. Check for Taluk Match
      if (lowerQuery.includes(taluk.toLowerCase().split(' ')[0])) {
        // If a taluk name is found, but no village was matched, set the taluk and district
        newFilters.district = district;
        newFilters.taluk = taluk;
        // DO NOT return here, continue checking other districts for better matches if necessary
        // But for mock data, setting the highest match is often enough
        // We'll set it and continue the loop, letting a better match override
        // If we reach the end and this is the best match, it will be returned.
        if (!newFilters.village) {
          newFilters.taluk = taluk;
          newFilters.district = district;
        }
      }
    }

    // 3. Check for District Match (least specific)
    if (lowerQuery.includes(district.toLowerCase())) {
      if (!newFilters.district) {
        // Only set district if a more specific match wasn't already found
        newFilters.district = district;
      }
    }
  }

  // Fallback: If no match was found, try a simple district match one last time
  if (!newFilters.district) {
    if (lowerQuery.includes('chennai')) {
      newFilters.district = 'Chennai';
    } else if (lowerQuery.includes('coimbatore')) {
      newFilters.district = 'Coimbatore';
    }
  }

  return newFilters;
};

const HomePage = () => {
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';
  const [filters, setFilters] = useState({
    state: 'TN',
    district: '',
    taluk: '',
    village: '',
    propertyType: 'Apartment',
    minPrice: 0,
    maxPrice: 100000000,
    bhk: [],
    showAdvanced: false,
  });

  const [allProperties, setAllProperties] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [showListingsPanel, setShowListingsPanel] = useState(true);

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
  }, [location.state]);

  // --- Mock Data Fetching (API Simulation) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch properties from backend instead of JSON file
        const propertiesResponse = await fetch(`${API_BASE_URL}/api/properties`);
        if (!propertiesResponse.ok) {
          throw new Error(`HTTP error! status: ${propertiesResponse.status} for /api/properties`);
        }
        const propertiesData = await propertiesResponse.json();

        // backend returns an array now
        setAllProperties(propertiesData || []);

        // 2. Keep top picks from JSON for now (or also move to backend later)
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

  // --- END Mock Data Fetching ---

  // --- Filtering Logic ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter(property => {
      const districtMatch = !filters.district || property.district === filters.district;
      const talukMatch = !filters.taluk || property.taluk === filters.taluk;
      const villageMatch = !filters.village || property.village === filters.village;
      // ... (rest of filtering logic unchanged)
      let typeMatch = true;
      if (filters.propertyType) {
        const typeFilter = filters.propertyType.toLowerCase().replace(/\s/g, '');
        const propertyType = property.type.toLowerCase().replace(/\s/g, '');

        if (typeFilter === 'standalonebuilding') {
          typeMatch = propertyType.includes('independenthouse') || propertyType.includes('house');
        } else if (typeFilter === 'apartment' || typeFilter === 'independenthouse' || typeFilter === 'gatedcommunity') {
          typeMatch = propertyType.includes(typeFilter.slice(0, 4)) || propertyType.includes('flat');
        } else {
          typeMatch = propertyType.includes(typeFilter);
        }
      }

      let bhkMatch = true;
      if (filters.bhk.length > 0) {
        const propertyBhkValue = property.bhk.includes('BHK') ? parseInt(property.bhk.split(' ')[0]) : property.bhk;
        bhkMatch = filters.bhk.some(bhkFilter => {
          if (bhkFilter === '4 BHK') return parseInt(propertyBhkValue) >= 4;
          if (bhkFilter === '1 RK') return propertyBhkValue === 1 || propertyBhkValue === '1';
          return propertyBhkValue === parseInt(bhkFilter.split(' ')[0]);
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
    // Default Center (Chennai) and Zoom (State/Region View)
    let center = [13.0827, 80.2707]; // General TN/Chennai center
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

    // Centering Logic (Focus on filtered properties)
    if (filteredProperties.length > 0) {
      const latSum = filteredProperties.reduce((sum, p) => sum + p.location.lat, 0);
      const lngSum = filteredProperties.reduce((sum, p) => sum + p.location.lng, 0);
      center = [latSum / filteredProperties.length, lngSum / filteredProperties.length];
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

      {/* 2. Main Map Content Area (80vh height) */}
      <div className="main-map-area">

        {/* --- FLOATING FILTER PANEL (LEFT) --- */}
        <div className={filterPanelClass}>

          {showFilterPanel ? (
            <>
              {/* ... (Basic Filters/Selects unchanged) ... */}
              <div className={`basic-filter-section ${filters.showAdvanced ? 'hidden' : 'visible'}`}>

                <div className="location-filter-group">
                  <select
                    value={filters.district}
                    onChange={(e) => handleFilterChange({ district: e.target.value, taluk: '', village: '' })}
                  >
                    <option value="">Select District</option>
                    {Object.keys(LOCATION_DATA).map(d => <option key={d} value={d}>{d}</option>)}
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

        {/* The Map (Now using UnifiedMap) */}
        <div className="map-container">
          <UnifiedMap
            mode="home" // <-- Set mode to home
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
        <h2 className="section-header">All {filteredProperties.length} Properties in {filters.district || 'Tamil Nadu'}</h2>
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