import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import UnifiedMap from './UnifiedMap'; // <-- Use UnifiedMap
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/search', { 
        state: { 
          initialQuery: searchTerm.trim() 
        } 
      });
    }
  };

  return (
    <div className="landing-container"> 
      
      {/* Unified Map in 'landing' mode (default) */}
      <UnifiedMap mode="landing" />
      
      <div className="search-overlay-wrapper">
        <div className="search-overlay">
          <h1 className="landing-title">Find Your Dream Property in Tamil Nadu</h1>
          
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={24} />
              <input
                type="text"
                className="search-input"
                placeholder="Search district, taluk or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;