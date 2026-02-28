// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MenuBar from './components/MenuBar';
import PostPropertyFlow from './components/PostPropertyFlow';
import { endpoints } from './api/api';

import 'leaflet/dist/leaflet.css';

const AppContent = () => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [postModalTransactionType, setPostModalTransactionType] = useState('rent');
  const [menuPremiumProperties, setMenuPremiumProperties] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialPremiumProperties = async () => {
      try {
        // Default landing premium source. Can be switched later.
        const response = await endpoints.getProperties('rent', '1');
        const properties = response?.data?.data || [];

        if (isMounted) {
          setMenuPremiumProperties(properties);
        }
      } catch (error) {
        console.error('Initial premium fetch failed:', error);
      }
    };

    fetchInitialPremiumProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔹 Open Post Property Flow (used only in LandingPage)
  const handlePostPropertyClick = (transactionType) => {
    setPostModalTransactionType(transactionType);
    setShowPostModal(true);
    console.log("Opening Post Property Modal for:", postModalTransactionType);
  };

  // 🔹 After successful submit
  const handlePostPropertySuccess = () => {
    setShowPostModal(false);

    alert(
      "✅ Property Submitted Successfully!\n\n" +
      "Our backend team will review your property details.\n" +
      "Approval usually takes up to 24 hours.\n\n" +
      "Thank you for listing with us!"
    );
  };


  return (
    <>
      <MenuBar menuPremiumProperties={menuPremiumProperties} />

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onPostPropertyClick={handlePostPropertyClick}
              landingPremiumProperties={menuPremiumProperties}
            />
          }
        />
        <Route path="/search" element={<HomePage onPremiumPropertiesChange={setMenuPremiumProperties} />} />
        <Route path="/property/:id" element={<ProjectDetailsPage />} />
      </Routes>

      {showPostModal && (
        <PostPropertyFlow
          onClose={() => setShowPostModal(false)}
          initialTransactionType={postModalTransactionType}
          onSuccessfulPost={handlePostPropertySuccess}
        />
      )}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
