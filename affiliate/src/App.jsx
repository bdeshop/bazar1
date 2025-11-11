import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AffiliateRegister from './pages/AffiliateRegister'
import Profile from './pages/profile/Profile'
import Allaffiliate from './pages/allaffiliates/Allaffiliate'
import Commission from './pages/commission/Commission'
import Payout from './pages/payout/Payout'
import Earnings from './pages/earnings/Earnings'
import Paymentmethod from './pages/paymentmethod/Paymentmethod'
import Referlinks from './pages/referlinks/Referlinks'
import Referels from './pages/referels/Referels'
import Performance from './pages/performance/Performance'

// Create Branding Context
const BrandingContext = createContext();

// Custom hook to use the branding context
export const useBranding = () => {
  return useContext(BrandingContext);
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
        setLogoInHeader(response.data.data.logo);
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

  const setLogoInHeader = (logoPath) => {
    if (logoPath) {
      // Construct full URL with base_url
      const logoUrl = logoPath.startsWith('http') 
        ? logoPath 
        : `${base_url}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;

      // Store logo URL in localStorage or context for use in components
      localStorage.setItem('dynamicLogo', logoUrl);
      
      // Dispatch event for components that might be listening
      window.dispatchEvent(new Event('brandingUpdate'));

      console.log("Logo set to:", logoUrl);
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem('admin')
  const affiliate = localStorage.getItem('masterAffiliate')
  const affiliateToken = localStorage.getItem('masterAffiliateToken')
  
  // Allow access if either admin or (affiliate and affiliatetoken) exist
  const isAuthenticated = admin || (affiliate && affiliateToken)
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const admin = localStorage.getItem('admin')
  const affiliate = localStorage.getItem('masterAffiliate')
  const affiliateToken = localStorage.getItem('masterAffiliateToken')
  
  // Redirect to dashboard if either admin or (affiliate and affiliatetoken) exist
  const isAuthenticated = admin || (affiliate && affiliateToken)
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const App = () => {
  return (
    <BrandingProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route 
            exact 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route 
            exact 
            path="/register" 
            element={
              <PublicRoute>
                <AffiliateRegister />
              </PublicRoute>
            }
          />
          {/* Redirect root to login or dashboard based on auth status */}
          <Route 
            exact 
            path="/" 
            element={
              (localStorage.getItem('admin') || (localStorage.getItem('affiliate') && localStorage.getItem('affiliatetoken'))) ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          {/* ------------------------ Protected routes ----------------------- */}
          <Route 
            exact 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/earnings" 
            element={
              <ProtectedRoute>
                <Earnings />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/payment-methods" 
            element={
              <ProtectedRoute>
                <Paymentmethod />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/referral-links" 
            element={
              <ProtectedRoute>
                <Referlinks />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/referrals" 
            element={
              <ProtectedRoute>
                <Referels />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/performance" 
            element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/payout-history" 
            element={
              <ProtectedRoute>
                <Payout />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/affiliates" 
            element={
              <ProtectedRoute>
                <Allaffiliate />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/commission" 
            element={
              <ProtectedRoute>
                <Commission />
              </ProtectedRoute>
            }
          />
          <Route 
            exact 
            path="/affiliate/payout" 
            element={
              <ProtectedRoute>
                <Payout />
              </ProtectedRoute>
            }
          />
          {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
          <Route 
            path="*" 
            element={
              (localStorage.getItem('admin') || (localStorage.getItem('affiliate') && localStorage.getItem('affiliatetoken'))) ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </BrandingProvider>
  )
}

export default App