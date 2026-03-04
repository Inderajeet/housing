// MenuBar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/MenuBar.css";
import tnMapLeft from "../assets/tn-map.png"; // Left side map image for SALE
import tnMapRight from "../assets/tn-map-rent.png"; // Right side map image for RENT
import logo from "../assets/logo.png"; // Your logo image
import PremiumProperties from "./PremiumProperties";

const MenuBar = ({ menuPremiumProperties = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/search";
  const propertyData = location.state?.propertyData;
  const hasRentAmount = propertyData?.rent_amount !== null && propertyData?.rent_amount !== undefined && propertyData?.rent_amount !== "";
  const propertyMode = hasRentAmount ? "rent" : "sale";
  const currentLookingTo = location.state?.initialFilters?.lookingTo
    ? location.state.initialFilters.lookingTo
    : location.pathname.startsWith("/property/")
      ? propertyMode
      : isHomePage
        ? "rent"
        : "sale";

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
    <div
      className={`menu-bar-container ${
        currentLookingTo === "rent" ? "menu-bar-rent" : "menu-bar-sale"
      }`}
    >
      <div className="menu-content">
        {isHomePage ? (
          <div className="menu-premium-slot menu-premium-left">
            <PremiumProperties
              properties={menuPremiumProperties}
              position="menu-left"
              initialIndex={0}
              layout="menu"
            />
          </div>
        ) : (
          <button
            type="button"
            className="menu-left-section menu-action-card menu-sale-card"
            onClick={() => handleNavigate("sale")}
            style={{
              backgroundImage: `url(${tnMapLeft})`,
            }}
          >
            <div className="section-overlay sale-overlay" />
            <span className="section-text">SALE MANDI</span>
          </button>
        )}

        {/* Center - Logo */}
        <button type="button" className="menu-center menu-logo-card" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="logo-image" />
        </button>

        {isHomePage ? (
          <div className="menu-premium-slot menu-premium-right">
            <PremiumProperties
              properties={menuPremiumProperties}
              position="menu-right"
              initialIndex={1}
              layout="menu"
            />
          </div>
        ) : (
          <button
            type="button"
            className="menu-right-section menu-action-card menu-rent-card"
            onClick={() => handleNavigate("rent")}
            style={{
              backgroundImage: `url(${tnMapRight})`,
            }}
          >
            <div className="section-overlay rent-overlay" />
            <span className="section-text">RENT MANDI</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
