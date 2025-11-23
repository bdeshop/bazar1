import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Home from "./pages/home/Home";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Casino from "./pages/casino/Casino";
import Slots from "./pages/slots/Slots";
import Profile from "./pages/profile/Profile";
import Myreferel from "./pages/referel/Myreferel";
import Vip from "./pages/vip/Vip";
import Turnover from "./pages/turnover/Turnover";
import Bettings from "./pages/bettings/Bettings";
import Transaction from "./pages/transaction/Transaction";
import Notification from "./pages/notification/Notification";
import Deposit from "./pages/deposit/Deposit";
import Withdraw from "./pages/withdraw/Withdraw";
import Games from "./pages/games/Games";
import Singlegame from "./pages/games/Singlegame";
import Promotions from "./pages/promotions/Promotions";
import Mprofile from "./pages/profile/Mprofile";
import GamePage from "./pages/games/GamePage";
import Allgames from "./pages/allgames/Allgames";

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create Branding Context
const BrandingContext = createContext();

// Custom hook to use the branding context
export const useBranding = () => {
  return useContext(BrandingContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Validate token with backend
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token is invalid, remove it

      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    checkAuthStatus,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Branding Provider Component
export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchBrandingData();
  }, []);

  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/branding`);
      
      if (response.data.success && response.data.data) {
        setBranding(response.data.data);
        setFavicon(response.data.data.favicon);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const setFavicon = (faviconPath) => {
    if (faviconPath) {
      // Construct full URL with base_url
      const faviconUrl = faviconPath.startsWith('http') 
        ? faviconPath 
        : `${base_url}${faviconPath.startsWith('/') ? '' : '/'}${faviconPath}`;

      // Remove existing favicon if any
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Create new favicon link
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.href = faviconUrl;
      favicon.type = "image/x-icon";
      
      // Add to document head
      document.head.appendChild(favicon);

      console.log("Favicon set to:", faviconUrl);
    }
  };

  const value = {
    branding,
    loading,
    refreshBranding: fetchBrandingData
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

// Protected Route Component (only for authenticated users)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  return user && token ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if already logged in)
// Only used for auth pages like login/register
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  return user && token ? <Navigate to="/" replace /> : children;
};

// Public Route Component (accessible to all users)
const PublicRoute = ({ children }) => {
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrandingProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication routes (only for non-logged in users) */}
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              }
            />

            {/* Public routes (accessible to all users) */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/casino"
              element={
                <PublicRoute>
                  <Casino />
                </PublicRoute>
              }
            />
            <Route
              path="/promotions"
              element={
                <PublicRoute>
                  <Promotions />
                </PublicRoute>
              }
            />
            <Route
              path="/slots"
              element={
                <PublicRoute>
                  <Slots />
                </PublicRoute>
              }
            />
              <Route
              path="/all-games"
              element={
                <PublicRoute>
                  <Allgames />
                </PublicRoute>
              }
            />
            <Route
              path="/games"
              element={
                <PublicRoute>
                  <Games />
                </PublicRoute>
              }
            />
            <Route
              path="/game/:gameuuid"
              element={
                <PublicRoute>
                  <GamePage />
                </PublicRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <PublicRoute>
                  <Mprofile />
                </PublicRoute>
              }
            />
            {/* Protected routes (only for authenticated users) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referral-program/details"
              element={
                <ProtectedRoute>
                  <Myreferel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/vip-info"
              element={
                <ProtectedRoute>
                  <Vip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/turnover/uncomplete"
              element={
                <ProtectedRoute>
                  <Turnover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/betting-records/settled"
              element={
                <ProtectedRoute>
                  <Bettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/transaction-records"
              element={
                <ProtectedRoute>
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile/verify"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile/account"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile/info"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/inbox/notification"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/deposit"
              element={
                <ProtectedRoute>
                  <Deposit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/withdraw"
              element={
                <ProtectedRoute>
                  <Withdraw />
                </ProtectedRoute>
              }
            />
            <Route
              path="/single-game"
              element={
                <ProtectedRoute>
                  <Singlegame />
                </ProtectedRoute>
              }
            />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BrandingProvider>
    </AuthProvider>
  );
};

export default App;