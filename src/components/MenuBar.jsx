// src/components/MenuBar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';

const MenuBar = ({
  filters,
  onFilterChange,
  onLocationClick,
  onMenuToggle,
  user,
  onLoginClick,
  onLogout,
  onPostPropertyClick, // <<< new
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
              <div className="dropdown-item">Apartments</div>
              <div className="dropdown-item">Independent Houses</div>
              <div className="dropdown-item">Plots</div>
            </div>
          )}
        </div>
      </div>

      <div className="menu-bar-right">
        <button
          className="menu-item post-property"
          onClick={onPostPropertyClick}
        >
          Post Your Property
        </button>

        {user ? (
          <>
            <span
              className="menu-item user-info"
              style={{ color: '#7c3aed', fontWeight: '600' }}
            >
              Hi, {user.username}!
            </span>
            <button
              className="menu-item"
              onClick={onLogout}
              style={{ color: '#ef4444' }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <button className="menu-item" style={{ display: 'none' }}>Sign up</button>
            <button
              className="menu-item"
              onClick={onLoginClick}
              style={{ backgroundColor: '#ede9fe', color: '#7c3aed', fontWeight: '600' }}
            >
              Log in
            </button>
          </>
        )}

        <span className="menu-item favorite-icon" style={{ color: '#ef4444' }}>❤️</span>
        <button className="menu-item hamburger-menu" onClick={onMenuToggle}>☰</button>
      </div>
    </div>
  );
};

export default MenuBar;
