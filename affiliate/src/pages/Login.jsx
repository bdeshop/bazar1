import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const Login = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${base_url}/api/auth/master-affiliate/login`, formData);
      const { message, token, masterAffiliate } = res.data;
      
      if (token && masterAffiliate) {
        toast.success('Master affiliate login successful! Welcome back.');
        // Store master affiliate data and token in localStorage
        localStorage.setItem('masterAffiliate', JSON.stringify(masterAffiliate));
        localStorage.setItem('masterAffiliateToken', token);
        
        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setTimeout(() => {
          navigate("/master-affiliate/dashboard");
        }, 1000);
      } else {
        toast.error(message || 'Login failed');
      }
    } catch (err) {
      console.error('Master affiliate login error:', err);
      if (err.response?.status === 401) {
        if (err.response.data.message.includes('Account is')) {
          toast.error(err.response.data.message);
        } else {
          toast.error('Invalid email or password');
        }
      } else if (err.response?.status === 403) {
        toast.error(err.response.data.message);
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message === 'Network Error') {
        toast.error('Cannot connect to server. Please try again later.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if master affiliate is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('masterAffiliateToken');
    const masterAffiliate = localStorage.getItem('masterAffiliate');
    
    if (token && masterAffiliate) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate("/master-affiliate/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen font-poppins flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800 p-4">
      <Toaster position="top-center" />
      
      <div className="bg-gray-800/90 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md relative overflow-hidden border border-indigo-700">
        {/* Custom Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 bg-gray-900/90 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="loader"></div>
              <p className="text-gray-300 mt-4 text-sm">Signing in...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <div>
            <img
              src={logo}
              alt="Logo"
              className="w-16 md:w-20"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-4">Master Affiliate Login</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Sign in to your master affiliate account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-[5px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm md:text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center text-sm">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'SIGN IN AS MASTER AFFILIATE'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">

          {/* Account Status Information */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[5px] p-3 mt-4">
            <h4 className="text-amber-400 font-medium mb-1 text-sm">Account Activation Required</h4>
            <p className="text-amber-300 text-xs">
              Your master affiliate account must be activated by a super affiliate or admin before you can login.
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} Master Affiliate Program. All rights reserved.
          </p>
        </div>
      </div>

      {/* Spinner Styles */}
      <style>{`
        .loader {
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #8b5cf6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;