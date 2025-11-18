import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import '../styles/PropertyListings.css'; 

// --- Filter/Data Options (Mocked for the header) ---
// Note: These values must map to the filtering logic in HomePage.jsx
const PROPERTY_TYPES = ['Apartment', 'Independent House', 'Villa', 'Plot'];
const BHKS = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK'];
const PRICES = [
    { label: '₹0 - ₹5 Cr', min: 0, max: 50000000 },
    { label: '₹5 Cr - ₹10 Cr', min: 50000000, max: 100000000 },
    { label: '₹10 Cr+', min: 100000000, max: 999999999999 },
];
const SALE_TYPES = ['Resale', 'New Launch'];
const CONSTRUCTION_STATUS = ['Ready to Move', 'Under Construction'];
const SORT_OPTIONS = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
];

const ListingFilterBar = ({ filters, handleFilterChange, totalCount, locationDisplayName }) => {
    // Local state for search term (not hooked up to core filtering yet, but present for UI)
    const [searchTerm, setSearchTerm] = useState('');

    // --- Filter Chip Handlers ---
    const handlePropertyTypeChange = (value) => {
        handleFilterChange({ propertyType: value });
    };

    const handleBhkChange = (value) => {
        // If "BHK Type" is selected, pass it as a single element array for filtering
        handleFilterChange({ bhk: value ? [value] : [] }); 
    };

    const handlePriceRangeChange = (min, max) => {
        // Set the maxPrice to 100,000,000 (10 Cr) if "10 Cr+" is selected
        // This is important because our default maxPrice in App.jsx is 10 Cr.
        const newMax = max === 999999999999 ? 100000000 : max; // Adjust to default if "10 Cr+" is selected
        handleFilterChange({ minPrice: min, maxPrice: newMax });
    };

    // Helper to check if a price chip is currently active based on global filters
    const isActivePrice = (min, max) => {
        // Compare with the potentially adjusted max if it's the "10 Cr+" option
        const filterMaxForComparison = max === 999999999999 ? 100000000 : max;
        return filters.minPrice === min && filters.maxPrice === filterMaxForComparison;
    };


    return (
        <div className="listing-header-area">
            {/* Top Info Bar */}
            <div className="listing-info-bar">
                <span className="listing-path">Home / {locationDisplayName} / Flats for Sale</span>
                <span className="last-updated">Showing 1 - 30 of {totalCount}</span>
            </div>

            {/* Main Title and Sort */}
            <div className="listing-main-heading">
                <h1 className="listing-title">Flats for Sale in {locationDisplayName}</h1>
                <div className="sort-by-section">
                    <span>Sort by:</span>
                    <select
                        value={filters.sortBy || 'relevance'} 
                        onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                        className="sort-select"
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Main Filter Chips (Interactive) --- */}
            <div className="filter-chips-row">
                
                {/* Property Type */}
                <select
                    className={`filter-chip ${filters.propertyType ? 'active-chip' : ''}`}
                    value={filters.propertyType || ''}
                    onChange={(e) => handlePropertyTypeChange(e.target.value)}
                >
                    <option value="">Property Type</option>
                    {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>

                {/* BHK Type */}
                <select
                    className={`filter-chip ${filters.bhk.length > 0 ? 'active-chip' : ''}`}
                    value={filters.bhk.length > 0 ? filters.bhk[0] : ''}
                    onChange={(e) => handleBhkChange(e.target.value)}
                >
                    <option value="">BHK Type</option>
                    {BHKS.map(bhk => <option key={bhk} value={bhk}>{bhk}</option>)}
                </select>

                {/* Price Range */}
                <select
                    className={`filter-chip ${(filters.minPrice !== 0 || filters.maxPrice !== 100000000) ? 'active-chip' : ''}`}
                    // Find the label for the currently active filter, defaulting to the first option
                    value={PRICES.find(p => isActivePrice(p.min, p.max))?.label || PRICES[0].label}
                    onChange={(e) => {
                        const selectedPrice = PRICES.find(p => p.label === e.target.value);
                        if (selectedPrice) {
                            handlePriceRangeChange(selectedPrice.min, selectedPrice.max);
                        }
                    }}
                >
                    {PRICES.map(price => (
                        <option key={price.label} value={price.label}>
                            {price.label}
                        </option>
                    ))}
                </select>

                {/* Static Chips (Placeholder for more complex filters) */}
                <button className="filter-chip">Sale Type <ChevronDown size={14} /></button>
                <button className="filter-chip">Construction Status <ChevronDown size={14} /></button>
                <button className="filter-chip verified-chip"><Check size={14} /> Verified</button>
                <button className="filter-chip">Project</button>
                <button className="filter-chip expert-chip">Expert Pro Agents</button>
                <button className="filter-chip">More Filters <ChevronDown size={14} /></button>
            </div>

            {/* Search Bar and Ad Banner */}
            <div className="search-and-ad-container">
                <div className="search-bar-below-filters">
                    <Search className="search-icon-small" size={18} />
                    <input
                        type="text"
                        placeholder={`Looking for Property in ${locationDisplayName}.com offers ${totalCount}+ Flats & ...`}
                        className="search-input-full-width"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="read-more-link">read more</button>
                </div>

                <div className="owner-ad-banner">
                    <div className="ad-text">
                        <p className="ad-question">Are you a property owner looking to rent/sell?</p>
                        <button className="ad-button">Post your property for FREE</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingFilterBar;