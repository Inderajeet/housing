// MenuBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MenuBar.css";
import tnMapLeft from "../assets/tn-map.png"; // Left side map image
import tnMapRight from "../assets/tn-map.png"; // Right side map image
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
          <div className="section-overlay" />
          <span className="section-text">SALE MANDI</span>
        </div>

        {/* Center - Logo */}
        <div className="menu-center">
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
          <div className="section-overlay" />
          <span className="section-text">RENT MANDI</span>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;