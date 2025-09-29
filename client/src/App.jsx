import React, { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './components/login/Login'
import Register from './components/register/Register'
import Casino from './pages/casino/Casino'
import Slots from './pages/slots/Slots'
import Profile from './pages/profile/Profile'
import Myreferel from './pages/referel/Myreferel'
import Vip from './pages/vip/Vip'
import Turnover from './pages/turnover/Turnover'
import Bettings from './pages/bettings/Bettings'
import Transaction from './pages/transaction/Transaction'
import Notification from './pages/notification/Notification'
import Deposit from './pages/deposit/Deposit'
import Withdraw from './pages/withdraw/Withdraw'
import Games from './pages/games/Games'
import Singlegame from './pages/games/Singlegame'
import Promotions from './pages/promotions/Promotions'
import Mprofile from './pages/profile/Mprofile'

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
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
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Validate token with backend
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    checkAuthStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Protected Route Component (only for authenticated users)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  return user && token ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if already logged in)
// Only used for auth pages like login/register
const AuthRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  return user && token ? <Navigate to="/" replace /> : children;
};

// Public Route Component (accessible to all users)
const PublicRoute = ({ children }) => {
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication routes (only for non-logged in users) */}
          <Route path="/login" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />
          <Route path="/register" element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          } />
          
          {/* Public routes (accessible to all users) */}
          <Route path="/" element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } />
          <Route path="/casino" element={
            <PublicRoute>
              <Casino />
            </PublicRoute>
          } />
             <Route path="/promotions" element={
            <PublicRoute>
              <Promotions />
            </PublicRoute>
          } />
          <Route path="/slots" element={
            <PublicRoute>
              <Slots />
            </PublicRoute>
          } />
          <Route path="/games" element={
            <PublicRoute>
              <Games />
            </PublicRoute>
          } />
     <Route path="/my-profile" element={
            <PublicRoute>
              <Mprofile />
            </PublicRoute>
          } />
          {/* Protected routes (only for authenticated users) */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/referral-program/details" element={
            <ProtectedRoute>
              <Myreferel />
            </ProtectedRoute>
          } />
          <Route path="/member/vip-info" element={
            <ProtectedRoute>
              <Vip />
            </ProtectedRoute>
          } />
          <Route path="/member/turnover/uncomplete" element={
            <ProtectedRoute>
              <Turnover />
            </ProtectedRoute>
          } />
          <Route path="/member/betting-records/settled" element={
            <ProtectedRoute>
              <Bettings />
            </ProtectedRoute>
          } />
          <Route path="/member/transaction-records" element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          } />
          <Route path="/member/profile/verify" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/member/profile/account" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/member/profile/info" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/member/inbox/notification" element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          } />
          <Route path="/member/deposit" element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          } />
          <Route path="/member/withdraw" element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          } />
       <Route path="/single-game" element={
            <ProtectedRoute>
              <Singlegame />
            </ProtectedRoute>
          } />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App