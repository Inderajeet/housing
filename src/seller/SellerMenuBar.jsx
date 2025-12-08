import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MenuBar.css';

const SellerMenuBar = ({ user, onLogout }) => {
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);

    return (
        <div className="menu-bar-container seller-menu-bar-bg">
            <div className="menu-bar-left">
                <span className="seller-logo" style={{fontSize: '1.2rem', fontWeight: 'bold'}}>HOUSING <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: '#a855f7'}}>Seller</span></span>

                <Link to="/seller" className="seller-link">Dashboard</Link>
                <Link to="/seller/enquiries" className="seller-link">Enquiries</Link>
                <Link to="/seller/listings" className="seller-link">Listings</Link>
                <Link to="/seller/packages" className="seller-link">Packages</Link>
                
                {/* More Dropdown Implementation */}
                <div 
                    className="seller-link" 
                    style={{ position: 'relative', cursor: 'pointer', marginRight: '1rem' }}
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                >
                    More ▾
                    {showMoreDropdown && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', minWidth: '150px', zIndex: 1010 }}>
                            <div className="dropdown-item" style={{color: '#1f2937'}} onClick={(e) => { e.stopPropagation(); /* Add logic for Profile */ setShowMoreDropdown(false); }}>My Profile</div>
                            <div className="dropdown-item" style={{color: '#1f2937'}} onClick={(e) => { e.stopPropagation(); /* Add logic for Password */ setShowMoreDropdown(false); }}>Change Password</div>
                            <div className="dropdown-item" style={{color: '#1f2937'}} onClick={(e) => { e.stopPropagation(); /* Add logic for Logout */ onLogout(); setShowMoreDropdown(false); }}>Logout</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="menu-bar-right">
                <Link to="/search" className="seller-link" style={{fontSize: '0.9rem'}}>
                    &larr; Buyer View
                </Link>
                {/* + Add Property Link <<< UPDATED */}
                <Link to="/seller/add-property" style={{ textDecoration: 'none' }}>
                    <button className="seller-add-property" style={{ backgroundColor: '#7c3aed', padding: '0.5rem 1rem' }}>
                        + Add Property
                    </button>
                </Link>

                {user ? (
                    <button 
                        onClick={onLogout} 
                        className="menu-item" 
                        style={{ color: '#ef4444' }}
                    >
                        Log Out
                    </button>
                ) : (
                    <Link to="/" className="menu-item">Login</Link>
                )}
            </div>
        </div>
    );
};

export default SellerMenuBar;