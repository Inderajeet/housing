import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MenuBar from './components/MenuBar';
import SellerDashboard from './seller/SellerDashboard';
import SellerMenuBar from './seller/SellerMenuBar';
import LoginModal from './components/LoginModal'; // NEW Import
import SellerEnquiriesPage from './seller/SellerEnquiriesPage'; // NEW
import SellerListingsPage from './seller/SellerListingsPage';   // NEW
import SellerPackagesPage from './seller/SellerPackagesPage';   // NEW
import AddPropertyPage from './seller/AddPropertyPage';       // <<< NEW: Import the property posting page

// IMPORT LEAFLET CSS HERE
import 'leaflet/dist/leaflet.css'; // <--- CRITICAL FIX

// Component to handle conditional menu rendering and user context
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for managing user authentication and role
  const [user, setUser] = useState(null); // { role: 'buyer' | 'seller', username: '...' }
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Function to handle successful login from the modal
  const handleLogin = (role, username) => {
    const newUser = { role, username };
    setUser(newUser);
    setShowLoginModal(false);

    // Redirect based on role
    if (role === 'seller') {
      navigate('/seller');
    } else if (location.pathname === '/') {
      // Buyer/Default user goes to search if they logged in from landing
      navigate('/search');
    }
  };

  // Function to handle user logout
  const handleLogout = () => {
    setUser(null);
    navigate('/'); // Redirect to landing page on logout
  };

  // Determine which MenuBar to show
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isLandingPage = location.pathname === '/';

  let MenuComponent = null;

  if (isSellerRoute) {
    MenuComponent = SellerMenuBar;
  } else if (!isLandingPage) {
    MenuComponent = MenuBar;
  }

  // >>>>>> CRITICAL FIX: Define ProtectedSellerRoute here <<<<<<
  // Function to protect seller routes
  const ProtectedSellerRoute = ({ element }) => {
    // If the user is logged in AND their role is 'seller', render the requested element.
    // Otherwise, redirect them to the landing page with the login modal available.
    return user?.role === 'seller' ? element : <LandingPage onLoginClick={() => setShowLoginModal(true)} />;
  };
  // >>>>>> END CRITICAL FIX <<<<<<


  return (
    <>
      {/* Conditional MenuBars */}
      {MenuComponent && (
        <MenuComponent
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => setShowLoginModal(true)}
          // Dummy props for MenuBar to prevent errors, as they were in the original
          filters={{}}
          onFilterChange={() => { }}
          onLocationClick={() => { }}
          onMenuToggle={() => { }}
        />
      )}

      <Routes>
        {/* 1. Landing Page (Root) */}
        <Route path="/" element={<LandingPage onLoginClick={() => setShowLoginModal(true)} />} />
        {/* 2. Home Page (Buyer Search Route) */}
        <Route path="/search" element={<HomePage />} />
        {/* 3. Project Details Page */}
        <Route path="/project/:id" element={<ProjectDetailsPage />} />
        
        {/* 4. Seller Routes (Protected) */}
        <Route path="/seller" element={<ProtectedSellerRoute element={<SellerDashboard user={user} />} />} />
        <Route path="/seller/enquiries" element={<ProtectedSellerRoute element={<SellerEnquiriesPage user={user} />} />} />
        <Route path="/seller/listings" element={<ProtectedSellerRoute element={<SellerListingsPage user={user} />} />} />
        <Route path="/seller/packages" element={<ProtectedSellerRoute element={<SellerPackagesPage user={user} />} />} />
        
        {/* 5. ADD PROPERTY ROUTE <<< ADDED HERE */}
        <Route path="/seller/add-property" element={<ProtectedSellerRoute element={<AddPropertyPage />} />} />
      </Routes>

      {/* Login Modal (always rendered, conditionally visible) */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
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