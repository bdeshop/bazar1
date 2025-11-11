import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import logo from "../assets/logo.png";

const AffiliateRegister = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    website: '',
    paymentMethod: 'bkash',
    paymentDetails: {
      bkash: {
        phoneNumber: '',
        accountType: 'personal'
      },
      nagad: {
        phoneNumber: '',
        accountType: 'personal'
      },
      rocket: {
        phoneNumber: '',
        accountType: 'personal'
      },
      binance: {
        email: '',
        walletAddress: '',
        binanceId: ''
      }
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('paymentDetails.')) {
      const parts = name.split('.');
      const service = parts[1];
      const field = parts[2];
      
      setFormData(prev => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          [service]: {
            ...prev.paymentDetails[service],
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Phone validation (Bangladeshi format)
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^01[3-9]\d{8}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number. Use Bangladeshi format!';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const { paymentMethod, paymentDetails } = formData;
    
    switch (paymentMethod) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        if (!paymentDetails[paymentMethod]?.phoneNumber?.trim()) {
          newErrors[`${paymentMethod}Phone`] = `${paymentMethod} phone number is required`;
        } else if (!/^01[3-9]\d{8}$/.test(paymentDetails[paymentMethod].phoneNumber)) {
          newErrors[`${paymentMethod}Phone`] = `Invalid ${paymentMethod} phone number.`;
        }
        break;
      
      case 'binance':
        if (!paymentDetails.binance?.email?.trim()) {
          newErrors.binanceEmail = 'Binance email is required';
        } else if (!/\S+@\S+\.\S+/.test(paymentDetails.binance.email)) {
          newErrors.binanceEmail = 'Binance email is invalid';
        }
        if (!paymentDetails.binance?.walletAddress?.trim()) {
          newErrors.binanceWallet = 'Binance wallet address is required';
        }
        break;
      
      default:
        newErrors.paymentMethod = 'Please select a valid payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails[formData.paymentMethod]
      };

      const res = await axios.post(`${base_url}/api/auth/affiliate/register`, submitData);
      const { message, success } = res.data;
      
      if (success) {
        toast.success('Registration successful! Please wait for admin approval. You can login once your account is activated.');
        
        setTimeout(() => {
          navigate("/affiliate/login");
        }, 2000);
      } else {
        toast.error(message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Registration failed');
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

  // Check if affiliate is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('affiliatetoken');
    const affiliate = localStorage.getItem('affiliate');
    
    if (token && affiliate) {
      navigate("/affiliate/dashboard");
    }
  }, [navigate]);

  const renderPaymentForm = () => {
    const { paymentMethod, paymentDetails } = formData;

    switch (paymentMethod) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor={`${paymentMethod}Phone`} className="block text-sm font-medium text-gray-300 mb-2">
                {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Phone Number *
              </label>
              <input
                type="tel"
                id={`${paymentMethod}Phone`}
                name={`paymentDetails.${paymentMethod}.phoneNumber`}
                placeholder="--- --- ---"
                value={paymentDetails[paymentMethod]?.phoneNumber || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${
                  errors[`${paymentMethod}Phone`] ? 'border-red-500' : 'border-gray-600'
                } outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                disabled={loading}
              />
              {errors[`${paymentMethod}Phone`] && (
                <p className="text-xs text-red-400 mt-1">{errors[`${paymentMethod}Phone`]}</p>
              )}
            </div>

            <div>
              <label htmlFor={`${paymentMethod}AccountType`} className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <select
                id={`${paymentMethod}AccountType`}
                name={`paymentDetails.${paymentMethod}.accountType`}
                value={paymentDetails[paymentMethod]?.accountType || 'personal'}
                onChange={handleChange}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border border-gray-600 rounded-[5px] outline-none transition duration-200 text-white text-sm md:text-base"
                disabled={loading}
              >
                <option value="personal">Personal Account</option>
                <option value="merchant">Merchant Account</option>
              </select>
            </div>
          </div>
        );

      case 'binance':
        return (
          <div className="space-y-3">
            <div>
              <label htmlFor="binanceEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Binance Email *
              </label>
              <input
                type="email"
                id="binanceEmail"
                name="paymentDetails.binance.email"
                placeholder="email@example.com"
                value={paymentDetails.binance?.email || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${
                  errors.binanceEmail ? 'border-red-500' : 'border-gray-600'
                } outline-none  transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                disabled={loading}
              />
              {errors.binanceEmail && (
                <p className="text-xs text-red-400 mt-1">{errors.binanceEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="binanceWallet" className="block text-sm font-medium text-gray-300 mb-2">
                Binance Wallet Address *
              </label>
              <input
                type="text"
                id="binanceWallet"
                name="paymentDetails.binance.walletAddress"
                placeholder="Enter your Binance wallet address"
                value={paymentDetails.binance?.walletAddress || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${
                  errors.binanceWallet ? 'border-red-500' : 'border-gray-600'
                } outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                disabled={loading}
              />
              {errors.binanceWallet && (
                <p className="text-xs text-red-400 mt-1">{errors.binanceWallet}</p>
              )}
            </div>

            <div>
              <label htmlFor="binanceId" className="block text-sm font-medium text-gray-300 mb-2">
                Binance ID (Optional)
              </label>
              <input
                type="text"
                id="binanceId"
                name="paymentDetails.binance.binanceId"
                placeholder="Your Binance ID (optional)"
                value={paymentDetails.binance?.binanceId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border border-gray-600 rounded-[5px] outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base"
                disabled={loading}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-poppins flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800 py-8 px-4">
      <Toaster position="top-center" />
      
      <div className="bg-gray-800/90 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-xl w-full max-w-2xl relative overflow-hidden border border-emerald-700 my-auto">
        {/* Custom Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 bg-gray-900/90 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center">
              <div className="loader"></div>
              <p className="text-gray-300 mt-4 text-sm">Creating your account...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div>
            <img
              src={logo}
              alt="Logo"
              className="w-16 md:w-20"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-3 text-center">Affiliate Program</h1>
          <p className="text-gray-400 text-sm mt-1 text-center">Join our affiliate network</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 space-x-3 md:space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-emerald-600 border-emerald-600' : 'border-gray-500'}`}>
                <span className="text-xs md:text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-xs md:text-sm">Basic Info</span>
            </div>
            <div className={`w-8 md:w-12 h-0.5 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-emerald-600 border-emerald-600' : 'border-gray-500'}`}>
                <span className="text-xs md:text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-xs md:text-sm">Payment</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto pr-2">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.firstName ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.lastName ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

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
                  className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.email ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="--- --- ---"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.phone ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Company (optional)"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border border-gray-600 rounded-[5px] outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://yourwebsite.com (optional)"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border border-gray-600 rounded-[5px] outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.password ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 md:px-4 md:py-3 bg-gray-700/50 border rounded-[5px] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} outline-none transition duration-200 text-white placeholder-gray-400 text-sm md:text-base`}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-[5px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm md:text-base"
                disabled={loading}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['bkash', 'nagad', 'rocket', 'binance'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className={`p-3 border cursor-pointer rounded-[5px] text-center transition-all duration-200 ${
                        formData.paymentMethod === method 
                          ? 'border-emerald-500 bg-emerald-500/20' 
                          : 'border-gray-600 bg-gray-700/50 hover:border-emerald-400'
                      }`}
                    >
                      <div className="text-white font-medium text-sm capitalize">
                        {method === 'bkash' ? 'bKash' : 
                         method === 'nagad' ? 'Nagad' : 
                         method === 'rocket' ? 'Rocket' : 
                         'Binance'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {renderPaymentForm()}

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[5px] p-3">
                <h4 className="text-emerald-400 font-medium mb-2 text-sm">Affiliate Benefits</h4>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• 10% commission on all referrals</li>
                  <li>• Real-time tracking dashboard</li>
                  <li>• Monthly payout system</li>
                  <li>• Dedicated affiliate support</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-[5px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm md:text-base"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-[5px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-sm md:text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center text-sm">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Already have an affiliate account?{' '}
            <Link to="/affiliate/login" className="text-emerald-400 hover:text-emerald-300 underline">
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            © {new Date().getFullYear()} Affiliate Program. All rights reserved.
          </p>
        </div>
      </div>

      {/* Spinner Styles */}
      <style>{`
        .loader {
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #10b981;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar for the form */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
};

export default AffiliateRegister;