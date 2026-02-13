// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedMap from './UnifiedMap';
import '../styles/LandingPage.css';
import logo from '../assets/sample-logo.png';

const LandingPage = ({ onPostPropertyClick }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('BUY');

  const handleTileClick = (lookingTo, type = null) => {
    navigate('/search', {
      state: {
        initialFilters: {
          lookingTo, // 'rent' or 'sale'
          type       // 1 | 2 | 3 | 'commercial'
        },
      },
    });
  };


  return (
    <div className="landing-container split-view">

      {/* Mobile Tabs - Circular Toggle Design */}
      <div className="mobile-tabs-toggle">
        <button
          className={`toggle-option ${activeTab === 'BUY' ? 'active' : ''}`}
          onClick={() => setActiveTab('BUY')}
        >
          BUY
        </button>

        <div className="toggle-logo-circle">
          <img src={logo} alt="Logo" className="toggle-logo" />
        </div>

        <button
          className={`toggle-option ${activeTab === 'RENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('RENT')}
        >
          RENT
        </button>
      </div>


      {/* 1. LEFT SIDE: BUY/SALE */}
      {/* <div className={`landing-side sale-side ${activeTab !== 'BUY' ? 'mobile-hidden' : ''}`}> */}
      <div className={`landing-side sale-side ${activeTab === 'BUY' ? 'mobile-active' : 'mobile-inactive'}`}>


        <div className="map-background-overlay">
          <UnifiedMap mode="landing" />
        </div>

        <div className="side-content-wrapper">
          <div className="map-sketch-area">
            <div className="interactive-box buy-box">
              <span className="center-text">BUY</span>

              <div className="box-item" onClick={() => handleTileClick('sale', 'flat')}>FLAT</div>
              <div className="box-item" onClick={() => handleTileClick('sale', 'house')}>HOUSE</div>
              <div className="box-item" onClick={() => handleTileClick('sale', 'plot')}>PLOT</div>
              <div className="box-item" onClick={() => handleTileClick('sale', 'land')}>LAND</div>

            </div>
          </div>

          <button
            className="post-btn sale-btn"
            onClick={() => onPostPropertyClick('sale')}
          >
            POST PROPERTY FOR SALE
          </button>
        </div>
      </div>

      {/* 2. RIGHT SIDE: RENT */}
      {/* <div className={`landing-side rent-side ${activeTab !== 'RENT' ? 'mobile-hidden' : ''}`}> */}

      <div className={`landing-side rent-side ${activeTab === 'RENT' ? 'mobile-active' : 'mobile-inactive'}`}>

        <div className="map-background-overlay">
          <UnifiedMap mode="landing" />
        </div>

        <div className="side-content-wrapper">
          <div className="map-sketch-area">
            <div className="interactive-box rent-box">
              <span className="center-text">RENT</span>

              <div className="box-item" onClick={() => handleTileClick('rent', '1')}>1 BHK</div>
              <div className="box-item" onClick={() => handleTileClick('rent', '2')}>2 BHK</div>
              <div className="box-item" onClick={() => handleTileClick('rent', '3')}>3+ BHK</div>
              <div className="box-item" onClick={() => handleTileClick('rent', 'commercial')}>COMMERCIAL</div>


            </div>
          </div>

          <button
            className="post-btn rent-btn"
            onClick={() => onPostPropertyClick('rent')}
          >
            POST PROPERTY FOR RENT
          </button>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
