// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Import all required components
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MenuBar from './components/MenuBar';
import PostPropertyFlow from './components/PostPropertyFlow'; 
import SellerDashboard from './seller/SellerDashboard';
import SellerMenuBar from './seller/SellerMenuBar';
import LoginModal from './components/LoginModal';
import SellerEnquiriesPage from './seller/SellerEnquiriesPage';
import SellerListingsPage from './seller/SellerListingsPage';
import SellerPackagesPage from './seller/SellerPackagesPage';

import 'leaflet/dist/leaflet.css';

// Using a placeholder API endpoint for the demonstration
const API_BASE_URL = 'https://mock-api.com'; 

// Function to simulate the phone-otp/login/upgrade process
const mockPhoneOtpLogin = async (phone, role) => {
    // In a real application, you'd perform a fetch here.
    // For the demo, we simulate success and return a seller user.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate API response for a successful seller upgrade/login
    const updatedUser = {
        id: 101,
        phone: phone,
        first_name: 'New',
        is_buyer: true,
        is_seller: true, // Key change: now a seller
    };

    return {
        token: `mock-token-${phone}-seller`,
        user: updatedUser,
    };
};


const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // { role, username, backendUser, token }
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // State for Post Property Flow
  const [showPostModal, setShowPostModal] = useState(false);
  const [postModalTransactionType, setPostModalTransactionType] = useState('rent'); 

  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  const [loginDesiredRole, setLoginDesiredRole] = useState('buyer');

  // 🔹 HYDRATE USER FROM LOCALSTORAGE ON FIRST LOAD
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');

      if (!token || !savedUser) return;

      const backendUser = JSON.parse(savedUser);

      let role = 'buyer';
      if (backendUser.is_seller && !backendUser.is_buyer) role = 'seller';
      if (backendUser.is_seller && backendUser.is_buyer) role = 'both';

      const username =
        backendUser.phone ||
        backendUser.first_name ||
        backendUser.email ||
        'User';

      setUser({
        role,
        username,
        backendUser,
        token,
      });
    } catch (err) {
      console.error('Failed to restore user from localStorage:', err);
    }
  }, []);

  const handleLogin = (role, username, backendUser, token) => {
    const newUser = { role, username, backendUser, token };
    setUser(newUser);
    setShowLoginModal(false);

    if (token) {
      localStorage.setItem('authToken', token);
    }
    if (backendUser) {
      localStorage.setItem('authUser', JSON.stringify(backendUser));
    }

    const defaultTarget =
      role === 'seller' || role === 'both' ? '/seller' : '/search';

    const target = postLoginRedirect || defaultTarget;

    // The redirect logic here can be simplified as '/post-property-modal'
    // is no longer a valid redirect target after a successful Post flow.
    // We only use the standard redirect for explicit login actions.
    navigate(target);
    
    setPostLoginRedirect(null);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/search');
  };

  const isSellerRoute = location.pathname.startsWith('/seller');
  const isLandingPage = location.pathname === '/';

  // Determine which Menu Bar to show (or none)
  let MenuComponent = null;

  if (isSellerRoute) {
    MenuComponent = SellerMenuBar;
  } else if (!isLandingPage) {
    MenuComponent = MenuBar;
  }

  // 3. HANDLER: OPENS POST PROPERTY FLOW DIRECTLY
  // This is the handler passed to MenuBar, LandingPage, and ProtectedSellerRoute fallback
  const handlePostPropertyClick = (transactionType) => {
    setPostModalTransactionType(transactionType);
    setShowPostModal(true);
  };


  // 💥 HANDLER: Ensures user is logged in/upgraded to seller and then navigates
  const handlePostPropertySuccess = useCallback(async (phone) => {
    setShowPostModal(false); // Close the modal first

    // 1. If user is already logged in and is a seller, just navigate
    if (user && (user.role === 'seller' || user.role === 'both')) {
      alert("Property posted successfully! Navigating to listings.");
      navigate('/seller/listings');
      return;
    }
    
    // 2. Perform implicit login/role-upgrade using the collected phone number.
    try {
        // NOTE: In a real app, you would send the phone number and
        // the form data to an endpoint that either logs the user in,
        // upgrades their role to seller, or asks for OTP/password.
        
        // Mocking the API call and assuming success in role upgrade
        const data = await mockPhoneOtpLogin(phone, 'seller');
        
        // Successfully authenticated/upgraded! Update the App state.
        const updatedUser = data.user;
        let appRole = 'buyer';
        if (updatedUser.is_seller && !updatedUser.is_buyer) appRole = 'seller';
        if (updatedUser.is_seller && updatedUser.is_buyer) appRole = 'both';

        const newUser = { 
            role: appRole, 
            username: updatedUser.phone, 
            backendUser: updatedUser, 
            token: data.token 
        };
        setUser(newUser);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        
        alert("Property posted and your account has been successfully upgraded to Seller! Navigating to your listings.");

        // Final action: Navigate to the protected route AFTER state is updated
        navigate('/seller/listings');

    } catch (err) {
        console.error('Error during post-property login/upgrade:', err);
        // Fallback: Ask user to log in manually if implicit login fails
        setLoginDesiredRole('seller');
        setPostLoginRedirect('/seller/listings'); 
        setShowLoginModal(true);
    }
    
  }, [navigate, user]);


  // 🔹 PROTECT SELLER ROUTES & OPEN LOGIN WITH CORRECT REDIRECT
  const ProtectedSellerRoute = ({ element }) => {
    const isSeller =
      user?.role === 'seller' ||
      user?.role === 'both';

    if (isSeller) {
      return element;
    }

    return (
      <LandingPage
        onLoginClick={() => {
          setLoginDesiredRole('seller');
          setPostLoginRedirect(location.pathname);
          setShowLoginModal(true);
        }}
        // 💥 PROP PASSING FIX (1/2) - Pass handler to Protected Route fallback
        onPostPropertyClick={handlePostPropertyClick} 
      />
    );
  };
  

  return (
    <>
      {/* Menu Bar rendering */}
      {MenuComponent && (
        <MenuComponent
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => {
            setLoginDesiredRole('buyer');
            setPostLoginRedirect(null);
            setShowLoginModal(true);
          }}
          // Passing the handler down to the active MenuBar
          onPostPropertyClick={handlePostPropertyClick} 
          filters={{}}
          onFilterChange={() => {}}
          onLocationClick={() => {}}
          onMenuToggle={() => {}}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onLoginClick={() => {
                setLoginDesiredRole('buyer');
                setPostLoginRedirect(null);
                setShowLoginModal(true);
              }}
              // 💥 PROP PASSING FIX (2/2) - Pass handler to Root Route
              onPostPropertyClick={handlePostPropertyClick} 
            />
          }
        />
        <Route path="/search" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectDetailsPage />} />

        {/* Protected Seller Routes */}
        <Route
          path="/seller"
          element={
            <ProtectedSellerRoute
              element={<SellerDashboard user={user} />}
            />
          }
        />
        <Route
          path="/seller/enquiries"
          element={
            <ProtectedSellerRoute
              element={<SellerEnquiriesPage user={user} />}
            />
          }
        />
        <Route
          path="/seller/listings"
          element={
            <ProtectedSellerRoute
              element={<SellerListingsPage user={user} />}
            />
          }
        />
        <Route
          path="/seller/packages"
          element={
            <ProtectedSellerRoute
              element={<SellerPackagesPage user={user} />}
            />
          }
        />
      </Routes>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          desiredRole={loginDesiredRole}
        />
      )}
      
      {showPostModal && (
        <PostPropertyFlow
            onClose={() => setShowPostModal(false)}
            // Pass the state controlling the flow type
            initialTransactionType={postModalTransactionType}
            // Pass the success handler
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