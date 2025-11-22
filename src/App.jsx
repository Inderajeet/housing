// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MenuBar from './components/MenuBar';
import SellerDashboard from './seller/SellerDashboard';
import SellerMenuBar from './seller/SellerMenuBar';
import LoginModal from './components/LoginModal';
import SellerEnquiriesPage from './seller/SellerEnquiriesPage';
import SellerListingsPage from './seller/SellerListingsPage';
import SellerPackagesPage from './seller/SellerPackagesPage';
import AddPropertyPage from './seller/AddPropertyPage';

import 'leaflet/dist/leaflet.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://housing-backend.vercel.app';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null); // { role, username, backendUser, token }
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  let MenuComponent = null;

  if (isSellerRoute) {
    MenuComponent = SellerMenuBar;
  } else if (!isLandingPage) {
    MenuComponent = MenuBar;
  }

  // 🔹 PROTECT SELLER ROUTES & OPEN LOGIN WITH CORRECT REDIRECT
  const ProtectedSellerRoute = ({ element }) => {
    const isSeller =
      user?.role === 'seller' ||
      user?.role === 'both';

    if (isSeller) {
      return element;
    }

    // Not seller → show landing, and if they try to login, we want:
    //  - desiredRole = 'seller'
    //  - redirect back to the same seller path after login
    return (
      <LandingPage
        onLoginClick={() => {
          setLoginDesiredRole('seller');
          setPostLoginRedirect(location.pathname);
          setShowLoginModal(true);
        }}
      />
    );
  };

  const handlePostPropertyClick = async () => {
    // 1) Not logged in: login as seller, then go to /seller/add-property
    if (!user) {
      setLoginDesiredRole('seller');
      setPostLoginRedirect('/seller/add-property');
      setShowLoginModal(true);
      return;
    }

    // 2) Already seller/both: just go to add-property
    if (user.role === 'seller' || user.role === 'both') {
      navigate('/seller/add-property');
      return;
    }

    // 3) Logged in as buyer only → call backend to become seller
    try {
      const token = user.token || localStorage.getItem('authToken');
      if (!token) {
        setLoginDesiredRole('seller');
        setPostLoginRedirect('/seller/add-property');
        setShowLoginModal(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/become-seller`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to become seller:', data);
        return;
      }

      const updatedBackendUser = data.user;
      let updatedRole = 'buyer';
      if (updatedBackendUser.is_seller && !updatedBackendUser.is_buyer)
        updatedRole = 'seller';
      if (updatedBackendUser.is_seller && updatedBackendUser.is_buyer)
        updatedRole = 'both';

      const updatedUser = {
        ...user,
        role: updatedRole,
        backendUser: updatedBackendUser,
      };

      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedBackendUser));

      navigate('/seller/add-property');
    } catch (err) {
      console.error('Error in handlePostPropertyClick:', err);
    }
  };

  return (
    <>
      {MenuComponent && (
        <MenuComponent
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => {
            // Normal login from menus: buyer flow by default
            setLoginDesiredRole('buyer');
            setPostLoginRedirect(null);
            setShowLoginModal(true);
          }}
          filters={{}}
          onFilterChange={() => {}}
          onLocationClick={() => {}}
          onMenuToggle={() => {}}
          onPostPropertyClick={handlePostPropertyClick}
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
            />
          }
        />
        <Route path="/search" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectDetailsPage />} />

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
        <Route
          path="/seller/add-property"
          element={
            <ProtectedSellerRoute element={<AddPropertyPage />} />
          }
        />
      </Routes>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          desiredRole={loginDesiredRole}
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
