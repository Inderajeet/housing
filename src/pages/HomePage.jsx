import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedMap from '../components/UnifiedMap';
import FilterPanel from '../components/FilterPanel';
import PropertyListings from '../components/PropertyListings';
import PremiumProperties from '../components/PremiumProperties';
import { endpoints } from '../api/api'; // Ensure this matches your new API file
import '../styles/HomePage.css';

const LOCATION_DATA = {
  'Chennai': [13.0827, 80.2707],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198], // Adding a few more just in case
  'Trichy': [10.7905, 78.7047],
  'Tamil Nadu': [10.7905, 78.7047]
};
const HomePage = () => {
  const location = useLocation();

  // --- 1. States for Dynamic API Data ---
  const [districtsList, setDistrictsList] = useState([]);
  const [taluksList, setTaluksList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);

  // --- 2. Core Filter State (Restoring your original Structure) ---
  const [filters, setFilters] = useState({
    state: 'TN',
    district: '',      // Stores Name (for UI/Map)
    district_id: '',   // Stores ID (for API/Filtering)
    taluk: '',
    taluk_id: '',
    village: '',
    village_id: '',
    propertyType: 'Apartment',
    lookingTo: location.state?.initialFilters?.lookingTo || 'rent', // From Landing Page
    type: location.state?.initialFilters?.type || null,
    minPrice: 0,
    maxPrice: 100000000,
    bhk: location.state?.initialFilters?.bhk ? [location.state.initialFilters.bhk] : [],
    showAdvanced: false,
  });

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const [showListingsPanel, setShowListingsPanel] = useState(true);

  // --- 3. API Fetching Logic ---

  // Initial Load: Districts + Properties (Rent/Sale)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [distRes, propRes] = await Promise.all([
          endpoints.getDistricts(),
          endpoints.getProperties(filters.lookingTo, filters.type)
        ]);
        setDistrictsList(distRes.data || []);
        setAllProperties(propRes.data?.data || []);

      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [filters.lookingTo]);

  // Fetch Taluks when District changes
  useEffect(() => {
    if (!filters.district_id) { setTaluksList([]); setVillagesList([]); return; }
    endpoints.getTaluks(filters.district_id).then(res => setTaluksList(res.data || []));
  }, [filters.district_id]);

  // Fetch Villages when Taluk changes
  useEffect(() => {
    if (!filters.taluk_id) { setVillagesList([]); return; }
    endpoints.getVillages(filters.taluk_id).then(res => setVillagesList(res.data || []));
  }, [filters.taluk_id]);

  // --- 4. Filtering Logic (Matches Right Panel) ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      // Location Matches (Using IDs for accuracy with DB)
      const dMatch = !filters.district_id || Number(p.district_id) === Number(filters.district_id);
      const tMatch = !filters.taluk_id || Number(p.taluk_id) === Number(filters.taluk_id);
      const vMatch = !filters.village_id || Number(p.village_id) === Number(filters.village_id);

      // Price Match (Checks rent_amount or sale_price depending on mode)
      const price = Number(p.rent_amount || p.sale_price || 0);
      const pMatch = price >= filters.minPrice && price <= filters.maxPrice;

      // BHK Match
      let bhkMatch = true;
      if (filters.bhk.length > 0) {
        const pBhk = parseInt(p.bhk);
        bhkMatch = filters.bhk.some(f => f === '4+ BHK' ? pBhk >= 4 : parseInt(f) === pBhk);
      }

      return dMatch && tMatch && vMatch && pMatch && bhkMatch;
    });
  }, [filters, allProperties]);
  useEffect(() => {
    // 1. Logic for Village/Taluk (Deep Zoom)
    if (filters.village_id || filters.taluk_id) {
      if (filteredProperties.length > 0) {
        const firstProp = filteredProperties[0];
        setFilters(prev => ({
          ...prev,
          mapCenter: [Number(firstProp.latitude), Number(firstProp.longitude)],
          mapZoom: filters.village_id ? 15 : 13
        }));
      }
      return;
    }

    // 2. Logic for District Selection (Mid Zoom - Show the whole city)
    // This solves your "Going to Avadi property instead of Chennai center" issue
    if (filters.district && LOCATION_DATA[filters.district]) {
      setFilters(prev => ({
        ...prev,
        mapCenter: LOCATION_DATA[filters.district],
        mapZoom: 11 // This keeps it zoomed out enough to see the city
      }));
      return;
    }

    // 3. Logic for State (Wide Zoom)
    setFilters(prev => ({
      ...prev,
      mapCenter: [10.7905, 78.7047],
      mapZoom: 7
    }));
  }, [filters.district_id, filters.taluk_id, filters.village_id]);
  // NOTE: I removed filteredProperties from dependencies to stop it from 
  // "shaking" or over-correcting when the list loads.
  const handleFilterChange = (newValues) => setFilters(prev => ({ ...prev, ...newValues }));


  if (loading) return <div className="loading-state">Loading {filters.lookingTo} Properties...</div>;

  const filterPanelClass = `floating-filter-panel ${showFilterPanel ? 'expanded' : 'minimized'} ${filters.showAdvanced ? 'advanced-active' : 'basic-active'}`;

  return (
    <div className="home-container">
      <div className="main-map-area">

        {/* --- FLOATING FILTER PANEL (LEFT) - REVERTED STYLES --- */}
        <div className={filterPanelClass}>
          {showFilterPanel ? (
            <>
              <div className={`basic-filter-section ${filters.showAdvanced ? 'hidden' : 'visible'}`}>
                <div className="location-filter-group">
                  <select
                    value={filters.district_id}
                    onChange={(e) => {
                      const selected = districtsList.find(d => String(d.district_id) === e.target.value);
                      handleFilterChange({
                        district_id: e.target.value,
                        district: selected?.district_name || '',
                        taluk_id: '', taluk: '', village_id: '', village: ''
                      });
                    }}
                  >
                    <option value="">Select District</option>
                    {districtsList.map(d => (
                      <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                    ))}
                  </select>

                  <select
                    value={filters.taluk_id}
                    onChange={(e) => {
                      const selected = taluksList.find(t => String(t.taluk_id) === e.target.value);
                      handleFilterChange({
                        taluk_id: e.target.value,
                        taluk: selected?.taluk_name || '',
                        village_id: '', village: ''
                      });
                    }}
                    disabled={!filters.district_id}
                  >
                    <option value="">Select Taluk</option>
                    {taluksList.map(t => (
                      <option key={t.taluk_id} value={t.taluk_id}>{t.taluk_name}</option>
                    ))}
                  </select>
                  <select
                    value={filters.village_id}
                    onChange={(e) => {
                      const selected = villagesList.find(v => String(v.village_id) === e.target.value);
                      handleFilterChange({
                        village_id: e.target.value,
                        village: selected?.village_name || ''
                      });
                    }}
                    disabled={!filters.taluk_id}
                  >
                    <option value="">Select Village/Area</option>
                    {villagesList.map(v => (
                      <option key={v.village_id} value={v.village_id}>{v.village_name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {filters.showAdvanced && (
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => handleFilterChange({ showAdvanced: false })}
                  isModal={true}
                />
              )}
            </>
          ) : (
            <button className="minimize-toggle-btn" onClick={() => setShowFilterPanel(true)}>🔍</button>
          )}
        </div>

        <PremiumProperties
          properties={filteredProperties}
          position="top"
          initialIndex={1}
        />
        <PremiumProperties
          properties={filteredProperties}
          position="bottom"
          initialIndex={0}
        />
        <PremiumProperties
          properties={filteredProperties}
          position="right-top"
          initialIndex={2}
        />
        <PremiumProperties
          properties={filteredProperties}
          position="right-bottom"
          initialIndex={3}
        />

        {/* --- MAP --- */}
        <div className="map-container">
          <UnifiedMap
            properties={filteredProperties}
            activeDistrict={filters.district}
            mapCenter={filters.mapCenter}
            mapZoom={filters.mapZoom}
          />
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
            <button className="minimize-toggle-btn" onClick={() => setShowListingsPanel(true)}>
              🏠 ({filteredProperties.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
