// src/components/MenuBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';

const MenuBar = () => {
  return (
    <div className="menu-bar-container">
      <div className="menu-bar-left">
        <Link to="/" className="logo">NB</Link>
      </div>

      <div className="menu-bar-right">
        <span
          className="menu-item favorite-icon"
          style={{ color: '#ef4444', fontSize: '18px', cursor: 'pointer' }}
          title="Wishlist"
        >
          ❤️
        </span>
      </div>
    </div>
  );
};

export default MenuBar;
