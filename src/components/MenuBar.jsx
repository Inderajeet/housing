// MenuBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MenuBar.css";
import tnMapLeft from "../assets/tn-map.png"; // Left side map image for SALE
import tnMapRight from "../assets/tn-map-rent.png"; // Right side map image for RENT
import logo from "../assets/logo.png"; // Your logo image

const MenuBar = () => {
  const navigate = useNavigate();

  const handleNavigate = (type) => {
    // Navigate to landing page with state
    navigate("/", {
      state: {
        initialFilters: {
          lookingTo: type, // 'sale' or 'rent'
        },
      },
    });
  };

  const handleLogoClick = () => {
    // Navigate to landing page without any filters (default view)
    navigate("/", {
      state: {
        initialFilters: {
          lookingTo: 'sale', // Default to sale/BUY view
        },
      },
    });
  };

  return (
    <div className="menu-bar-container">
      <div className="menu-content">
        {/* Left - Sale with its own background */}
        <div 
          className="menu-left-section"
          onClick={() => handleNavigate("sale")}
          style={{
            backgroundImage: `url(${tnMapLeft})`,
          }}
        >
          <div className="section-overlay sale-overlay" />
          <span className="section-text">SALE MANDI</span>
        </div>

        {/* Center - Logo */}
        <div className="menu-center" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="logo-image" />
        </div>

        {/* Right - Rent with its own background */}
        <div 
          className="menu-right-section"
          onClick={() => handleNavigate("rent")}
          style={{
            backgroundImage: `url(${tnMapRight})`,
          }}
        >
          <div className="section-overlay rent-overlay" />
          <span className="section-text">RENT MANDI</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;