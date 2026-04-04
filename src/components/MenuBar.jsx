// MenuBar.jsx
import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "../styles/MenuBar.css";
import tnMapLeft from "../assets/tn-map.png"; // Left side map image for SALE
import tnMapRight from "../assets/tn-map-rent.png"; // Right side map image for RENT
import logo from "../assets/logo_new.png"; // Your logo image
import PremiumProperties from "./PremiumProperties";

const MenuBar = ({ menuPremiumProperties = [] }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isHomePage = location.pathname === "/search";
  const propertyPathParts = location.pathname.split("/").filter(Boolean);
  const propertyMode = propertyPathParts[0] === "property" ? propertyPathParts[1] : null;
  const currentLookingTo = isHomePage
    ? searchParams.get("type") || "rent"
    : propertyMode || searchParams.get("type") || "sale";

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
          <Link
            className="menu-left-section menu-action-card menu-sale-card"
            to="/?type=sale"
            style={{
              backgroundImage: `url(${tnMapLeft})`,
            }}
          >
            <div className="section-overlay sale-overlay" />
            <span className="section-text">SALE MANDI</span>
          </Link>
        )}

        {/* Center - Logo */}
        <Link to="/" className="menu-center menu-logo-card">
          <img src={logo} alt="Logo" className="logo-image" />
        </Link>

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
          <Link
            className="menu-right-section menu-action-card menu-rent-card"
            to="/?type=rent"
            style={{
              backgroundImage: `url(${tnMapRight})`,
            }}
          >
            <div className="section-overlay rent-overlay" />
            <span className="section-text">RENT MANDI</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MenuBar;
