// Updated LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = ({ onPostPropertyClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('BUY');

  // Read the initial filter from navigation state
  useEffect(() => {
    if (location.state?.initialFilters?.lookingTo) {
      const lookingTo = location.state.initialFilters.lookingTo;
      // Set active tab based on the lookingTo value
      setActiveTab(lookingTo === 'sale' ? 'BUY' : 'RENT');
      
      // Optionally, you can scroll to the appropriate section or show a highlight
      console.log(`Navigated to ${lookingTo} section`);
    }
  }, [location.state]);

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
    <div className="landing-container">

      {/* Show only the active side */}
      {activeTab === 'BUY' && (
        <div className="landing-side sale-side">
          <div className="map-background-overlay" aria-hidden="true" />

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

            {/* Desktop button */}
            <button
              className="post-btn sale-btn desktop-only"
              onClick={() => onPostPropertyClick('sale')}
            >
              POST PROPERTY FOR SALE
            </button>
          </div>
        </div>
      )}

      {activeTab === 'RENT' && (
        <div className="landing-side rent-side">
          <div className="map-background-overlay" aria-hidden="true" />

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

            {/* Desktop button */}
            <button
              className="post-btn rent-btn desktop-only"
              onClick={() => onPostPropertyClick('rent')}
            >
              POST PROPERTY FOR RENT
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Actions - Context aware based on active tab */}
      <div className="mobile-only bottom-post-actions">
        {activeTab === 'BUY' ? (
          <button
            className="post-btn sale-btn mobile-btn"
            onClick={() => onPostPropertyClick('sale')}
          >
            POST PROPERTY FOR SALE
          </button>
        ) : (
          <button
            className="post-btn rent-btn mobile-btn"
            onClick={() => onPostPropertyClick('rent')}
          >
            POST PROPERTY FOR RENT
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPage;