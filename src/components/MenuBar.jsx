// src/components/MenuBar.jsx (UPDATED - Separated Post Buttons)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';

const MenuBar = ({
  filters,
  onFilterChange,
  onLocationClick,
  onMenuToggle,
  onPostPropertyClick, // This handler now needs to accept 'rent' or 'sell'
}) => {
  const [showBuyDropdown, setShowBuyDropdown] = useState(false);

  return (
    <div className="menu-bar-container">
      <div className="menu-bar-left">
        <Link to="/search" className="logo">NB</Link>

        <div
          className="buy-dropdown-toggle menu-item"
          onClick={() => setShowBuyDropdown(!showBuyDropdown)}
        >
          Buy <span className="dropdown-arrow">▼</span>
          {showBuyDropdown && (
            <div className="buy-dropdown-menu">
              <Link to="/search" state={{ initialFilters: { propertyType: 'Apartment' } }} className="dropdown-item">Apartments</Link>
              <Link to="/search" state={{ initialFilters: { propertyType: 'Independent House' } }} className="dropdown-item">Independent Houses</Link>
              <Link to="/search" state={{ initialFilters: { propertyType: 'Plot' } }} className="dropdown-item">Plots</Link>
            </div>
          )}
        </div>
      </div>

      <div className="menu-bar-right">
        {/* Buyer View button (just links to search page now) */}
        <Link 
          to="/search" 
          className="menu-item buyer-view"
          style={{ color: '#7c3aed', fontWeight: '600' }}
        >
          Buyer View
        </Link>
        
        {/* Sell Button */}
        <button
          className="menu-item post-property sell-btn"
          onClick={() => onPostPropertyClick('sell')} // Call handler with 'sell'
        >
          Sell Your Property
        </button>
        
        {/* Rent Button */}
        <button
          className="menu-item post-property rent-btn"
          onClick={() => onPostPropertyClick('rent')} // Call handler with 'rent'
        >
          Rent Your Property
        </button>

        <span className="menu-item favorite-icon" style={{ color: '#ef4444' }}>❤️</span>
        <button className="menu-item hamburger-menu" onClick={onMenuToggle}>☰</button>
      </div>
    </div>
  );
};

export default MenuBar;