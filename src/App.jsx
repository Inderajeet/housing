// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MenuBar from './components/MenuBar';
import PostPropertyFlow from './components/PostPropertyFlow';

import 'leaflet/dist/leaflet.css';

const AppContent = () => {
  const location = useLocation();

  const [showPostModal, setShowPostModal] = useState(false);
  const [postModalTransactionType, setPostModalTransactionType] = useState('rent');

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

  // 🔹 Show MenuBar only AFTER landing page
  const showMenuBar = location.pathname !== '/';

  return (
    <>
      {showMenuBar && <MenuBar />}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onPostPropertyClick={handlePostPropertyClick}
            />
          }
        />
        <Route path="/search" element={<HomePage />} />
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
