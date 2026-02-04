// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedMap from './UnifiedMap'; // Import the UnifiedMap component
import '../styles/LandingPage.css';

const LandingPage = ({ onLoginClick, onPostPropertyClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('BUY');

  const handleTileClick = (propertyType, lookingTo, bhk = null) => {
    // Navigate to /search and pass the initial filter state
    navigate('/search', {
      state: {
        initialFilters: {
          propertyType: propertyType,
          lookingTo: lookingTo,
          bhk: bhk ? [bhk] : undefined
        }
      }
    });
  };

  return (
    <div className="landing-container split-view">

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button
          className={`tab-btn ${activeTab === 'BUY' ? 'active' : ''}`}
          onClick={() => setActiveTab('BUY')}
        >
          BUY
        </button>

        <button
          className={`tab-btn ${activeTab === 'RENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('RENT')}
        >
          RENT
        </button>
      </div>


      {/* 1. LEFT SIDE: BUY/SALE */}
      <div className={`landing-side sale-side ${activeTab !== 'BUY' ? 'mobile-hidden' : ''}`}>


        {/* Map Background Layer */}
        <div className="map-background-overlay">
          {/* Map of Tamil Nadu, fixed mode */}
          <UnifiedMap mode="landing" />
        </div>

        {/* Content Layer: Must use a wrapper to handle z-index and flex layout */}
        <div className="side-content-wrapper">

          <div className="map-sketch-area">
            <div className="interactive-box buy-box">
              <span className="center-text">BUY</span>

              <div className="buy-flat box-item" onClick={() => handleTileClick('Apartment', 'Buy')}>FLAT</div>
              <div className="buy-villa box-item" onClick={() => handleTileClick('Villa', 'Buy')}>VILLA</div>
              <div className="buy-house box-item" onClick={() => handleTileClick('Independent House', 'Buy')}>HOUSE</div>
              <div className="buy-plot box-item" onClick={() => handleTileClick('Plot', 'Buy')}>PLOT</div>
              <div className="buy-land box-item" onClick={() => handleTileClick('Land', 'Buy')}>LAND</div>
            </div>
          </div>

          {/* Button: Sale Your Property */}
          <button
            className="post-btn sale-btn"
            // 🚀 UPDATED: Pass 'sale' to the handler
            onClick={() => onPostPropertyClick('sale')}
          >
            POST PROPERTY FOR SALE
          </button>
        </div>
      </div>

      {/* 2. RIGHT SIDE: RENT */}
      <div className={`landing-side rent-side ${activeTab !== 'RENT' ? 'mobile-hidden' : ''}`}>


        {/* Map Background Layer */}
        <div className="map-background-overlay">
          {/* Map of Tamil Nadu, fixed mode */}
          <UnifiedMap mode="landing" />
        </div>

        {/* Content Layer: Must use a wrapper to handle z-index and flex layout */}
        <div className="side-content-wrapper">

          <div className="map-sketch-area">
            <div className="interactive-box rent-box">
              <span className="center-text">RENT</span>

              <div className="rent-1bhk box-item" onClick={() => handleTileClick('Apartment', 'Rent', '1 BHK')}>1 BHK</div>
              <div className="rent-2bhk box-item" onClick={() => handleTileClick('Apartment', 'Rent', '2 BHK')}>2 BHK</div>
              <div className="rent-3bhk box-item" onClick={() => handleTileClick('Apartment', 'Rent', '3+ BHK')}>3+ BHK</div>
              <div className="rent-commercial box-item" onClick={() => handleTileClick('Commercial', 'Rent')}>COMMERCIAL</div>
            </div>
          </div>

          {/* Button: Rent Your Property */}
          <button
            className="post-btn rent-btn"
            // 🚀 UPDATED: Pass 'rent' to the handler
            onClick={() => onPostPropertyClick('rent')}
          >
            POST PROPERTY FOR RENT
          </button>
        </div>
      </div>
      {/* Mobile-only bottom buttons */}
      <div className="bottom-post-actions mobile-only">
        <button
          className="post-btn sale-btn"
          onClick={() => onPostPropertyClick('sale')}
        >
          POST PROPERTY FOR SALE
        </button>

        <button
          className="post-btn rent-btn"
          onClick={() => onPostPropertyClick('rent')}
        >
          POST PROPERTY FOR RENT
        </button>
      </div>

    </div>
  );
};

export default LandingPage;