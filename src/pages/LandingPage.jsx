// Updated LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PremiumProperties from '../components/PremiumProperties';
import '../styles/LandingPage.css';

const LandingPage = ({ onPostPropertyClick, landingPremiumProperties = [] }) => {
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

  const renderPremiumAds = () => (
    <>
      <div className="landing-premium-desktop">
        <div className="landing-premium-grid left-grid">
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="top" initialIndex={0} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="bottom" initialIndex={1} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="right-top" initialIndex={2} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="right-bottom" initialIndex={3} />
        </div>

        <div className="landing-premium-center-spacer" />

        <div className="landing-premium-grid right-grid">
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="top" initialIndex={4} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="bottom" initialIndex={5} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="right-top" initialIndex={6} />
          <PremiumProperties properties={landingPremiumProperties} layout="landing" position="right-bottom" initialIndex={7} />
        </div>
      </div>

      <div className="landing-premium-mobile">
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="top"
          initialIndex={0}
          className="landing-mobile-premium landing-mobile-premium-left-top"
        />
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="bottom"
          initialIndex={1}
          className="landing-mobile-premium landing-mobile-premium-left-bottom"
        />
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="right-top"
          initialIndex={2}
          className="landing-mobile-premium landing-mobile-premium-right-top"
        />
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="right-bottom"
          initialIndex={3}
          className="landing-mobile-premium landing-mobile-premium-right-bottom"
        />
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="right-bottom"
          initialIndex={4}
          className="landing-mobile-premium landing-mobile-premium-right-bottom-left"
        />
        <PremiumProperties
          properties={landingPremiumProperties}
          layout="landing"
          position="right-bottom"
          initialIndex={5}
          className="landing-mobile-premium landing-mobile-premium-right-bottom-top"
        />
      </div>
    </>
  );

  return (
    <div className="landing-container">

      {/* Show only the active side */}
      {activeTab === 'BUY' && (
        <div className="landing-side sale-side">
          <div className="map-background-overlay" aria-hidden="true" />
          {renderPremiumAds()}

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
          {renderPremiumAds()}

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
