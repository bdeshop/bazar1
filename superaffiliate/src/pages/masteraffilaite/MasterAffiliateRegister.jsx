import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaGlobe,
  FaCreditCard, 
  FaMobileAlt, 
  FaBitcoin,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaPercentage
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MasterAffiliateRegister = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const affiliate = JSON.parse(localStorage.getItem('affiliate'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Company Information
    company: '',
    website: '',
    promoMethod: 'social_media',
    
    // Commission Settings (Master Affiliate Specific)
    commissionSettings: {
      commissionRate: 0,
      depositRate: 0,
      commissionType: 'revenue_share',
      cpaRate: 0
    },
    
    // Payment Information
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
      },
      bank_transfer: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchName: '',
        routingNumber: '',
        swiftCode: ''
      }
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('paymentDetails.')) {
      const paymentField = name.replace('paymentDetails.', '');
      const [method, field] = paymentField.split('.');
      
      setFormData(prev => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          [method]: {
            ...prev.paymentDetails[method],
            [field]: value
          }
        }
      }));
    } else if (name.startsWith('commissionSettings.')) {
      const commissionField = name.replace('commissionSettings.', '');
      
      setFormData(prev => ({
        ...prev,
        commissionSettings: {
          ...prev.commissionSettings,
          [commissionField]: commissionField === 'commissionType' ? value : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear payment details error when user starts typing in payment fields
    if (formErrors.paymentDetails && name.includes('paymentDetails')) {
      setFormErrors(prev => ({
        ...prev,
        paymentDetails: ''
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.email) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.firstName) {
          errors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        }
        
        if (!formData.lastName) {
          errors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        }
        
        if (!formData.phone) {
          errors.phone = 'Phone number is required';
        } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
          errors.phone = 'Invalid Bangladeshi phone number format!';
        }
        break;

      case 2:
        // Validate commission settings
        if (formData.commissionSettings.commissionRate < 0 || formData.commissionSettings.commissionRate > 50) {
          errors.commissionRate = 'Commission rate must be between 0% and 50%';
        }
        
        if (formData.commissionSettings.depositRate < 0 || formData.commissionSettings.depositRate > 20) {
          errors.depositRate = 'Deposit rate must be between 0% and 20%';
        }
        
        if (formData.commissionSettings.cpaRate < 0) {
          errors.cpaRate = 'CPA rate cannot be negative';
        }
        break;

      case 3:
        const paymentMethod = formData.paymentMethod;
        const details = formData.paymentDetails[paymentMethod];

        switch (paymentMethod) {
          case 'bkash':
          case 'nagad':
          case 'rocket':
            if (!details.phoneNumber) {
              errors.paymentDetails = `${getMethodDisplayName(paymentMethod)} phone number is required`;
            } else if (!/^01[3-9]\d{8}$/.test(details.phoneNumber)) {
              errors.paymentDetails = `Invalid ${getMethodDisplayName(paymentMethod)} phone number. Use format: 01XXXXXXXXX`;
            }
            break;
          
          case 'binance':
            if (!details.email) {
              errors.paymentDetails = 'Binance email is required';
            } else if (!/\S+@\S+\.\S+/.test(details.email)) {
              errors.paymentDetails = 'Binance email is invalid';
            }
            if (!details.walletAddress) {
              errors.paymentDetails = 'Binance wallet address is required';
            }
            break;
          
          case 'bank_transfer':
            if (!details.bankName) {
              errors.paymentDetails = 'Bank name is required';
            }
            if (!details.accountName) {
              errors.paymentDetails = 'Account name is required';
            }
            if (!details.accountNumber) {
              errors.paymentDetails = 'Account number is required';
            }
            break;
          
          default:
            errors.paymentDetails = 'Please select a valid payment method';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const submitData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        promoMethod: formData.promoMethod,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentDetails[formData.paymentMethod],
        commissionSettings: formData.commissionSettings,
        createdBy: affiliate.id
      };

      const response = await axios.post(
        `${base_url}/api/affiliate/master-affiliate/register`,
        submitData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        toast.success('Master affiliate account created successfully! Waiting for admin approval.');
        navigate('/affiliate/master-affiliates'); // Redirect to master affiliates list
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 403) {
        toast.error('You are not authorized to create master affiliates');
        navigate('/affiliate/dashboard');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to create master affiliate account';
      toast.error(errorMessage);
      
      // Handle specific errors
      if (error.response?.data?.message?.includes('already exists')) {
        setFormErrors(prev => ({
          ...prev,
          email: 'An account with this email or phone already exists'
        }));
        setCurrentStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodDisplayName = (method) => {
    const names = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      binance: 'Binance',
      bank_transfer: 'Bank Transfer'
    };
    return names[method] || method;
  };

  const getMethodIcon = (method) => {
    const icons = {
      bkash: FaMobileAlt,
      nagad: FaMobileAlt,
      rocket: FaMobileAlt,
      binance: FaBitcoin,
      bank_transfer: FaCreditCard
    };
    return icons[method] || FaCreditCard;
  };

  const promoMethods = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'website', label: 'Website/Blog' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'blog', label: 'Blog' },
    { value: 'email_marketing', label: 'Email Marketing' },
    { value: 'other', label: 'Other' }
  ];

  const commissionTypes = [
    { value: 'revenue_share', label: 'Revenue Share' },
    { value: 'cpa', label: 'CPA (Cost Per Action)' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="w-full mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 sm:py-6 px-4 sm:px-6 rounded-lg shadow-lg">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                  Master Affiliate Registration
                </h1>
                <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                  Create a new master affiliate account under your super affiliate program
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                {[
                  { step: 1, label: 'Personal Info', icon: FaUser },
                  { step: 2, label: 'Commission', icon: FaPercentage },
                  { step: 3, label: 'Payment', icon: FaCreditCard }
                ].map(({ step, label, icon: Icon }) => (
                  <div key={step} className="flex items-center flex-1 w-full sm:w-auto">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border-2 ${
                          currentStep >= step
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 text-gray-500'
                        }`}
                      >
                        {currentStep > step ? (
                          <FaCheckCircle className="text-xs sm:text-sm lg:text-base" />
                        ) : (
                          <Icon className="text-xs sm:text-sm" />
                        )}
                      </div>
                      <div
                        className={`ml-2 sm:ml-3 text-xs sm:text-sm font-medium ${
                          currentStep >= step ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {label}
                      </div>
                    </div>
                    {step < 3 && (
                      <div
                        className={`mx-2 sm:mx-4 flex-1 h-1 hidden sm:block ${
                          currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border-[1px] border-gray-200 rounded-[10px] p-4 sm:p-6 shadow-sm">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="border-b border-gray-200 pb-3 sm:pb-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                        <FaUser className="mr-2 sm:mr-3 text-green-500 text-sm sm:text-base" />
                        Personal Information
                      </h2>
                      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">
                        Enter the basic personal details for the master affiliate
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter first name"
                          />
                        </div>
                        {formErrors.firstName && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter last name"
                          />
                        </div>
                        {formErrors.lastName && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter email address"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs sm:text-sm"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm password"
                          />
                        </div>
                        {formErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <div className="relative">
                          <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter company name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Promotion Method
                      </label>
                      <select
                        name="promoMethod"
                        value={formData.promoMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        {promoMethods.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Commission Settings */}
                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="border-b border-gray-200 pb-3 sm:pb-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                        <FaPercentage className="mr-2 sm:mr-3 text-green-500 text-sm sm:text-base" />
                        Commission Settings
                      </h2>
                      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">
                        Set the commission structure for this master affiliate
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start">
                        <FaShieldAlt className="text-green-500 text-base sm:text-lg mr-2 sm:mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-800 text-sm sm:text-base">Master Affiliate Benefits</h3>
                          <p className="text-green-700 text-xs sm:text-sm mt-1">
                            Master affiliates earn higher commissions and can manage sub-affiliates under them.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Bet Commission Rate (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="commissionSettings.commissionRate"
                            value={formData.commissionSettings.commissionRate}
                            onChange={handleInputChange}
                            min="0"
                            max="50"
                            step="0.1"
                            className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.commissionRate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0-50%"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm">%</span>
                        </div>
                        {formErrors.commissionRate && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.commissionRate}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Recommended: 5-15% for master affiliates
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Deposit Commission Rate (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="commissionSettings.depositRate"
                            value={formData.commissionSettings.depositRate}
                            onChange={handleInputChange}
                            min="0"
                            max="20"
                            step="0.1"
                            className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.depositRate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0-20%"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs sm:text-sm">%</span>
                        </div>
                        {formErrors.depositRate && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.depositRate}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Recommended: 1-5% for master affiliates
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Commission Type *
                        </label>
                        <select
                          name="commissionSettings.commissionType"
                          value={formData.commissionSettings.commissionType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {commissionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          CPA Rate (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="commissionSettings.cpaRate"
                            value={formData.commissionSettings.cpaRate}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.cpaRate ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {formErrors.cpaRate && (
                          <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center">
                            <FaExclamationCircle className="mr-1 text-xs" />
                            {formErrors.cpaRate}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Fixed amount per conversion (CPA model)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Information */}
                {currentStep === 3 && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="border-b border-gray-200 pb-3 sm:pb-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                        <FaCreditCard className="mr-2 sm:mr-3 text-green-500 text-sm sm:text-base" />
                        Payment Method
                      </h2>
                      <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">
                        Select how the master affiliate will receive payments
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                        Select Payment Method *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {['bkash', 'nagad', 'rocket', 'binance', 'bank_transfer'].map((method) => {
                          const IconComponent = getMethodIcon(method);
                          return (
                            <div
                              key={method}
                              className={`border-2 rounded-[5px] p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                                formData.paymentMethod === method
                                  ? 'border-green-500 bg-green-50 shadow-md'
                                  : 'border-gray-300 hover:border-green-300 hover:shadow-sm'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                            >
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className={`p-1 sm:p-2 rounded-lg ${
                                  formData.paymentMethod === method ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <IconComponent className="text-lg sm:text-xl" />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 block text-xs sm:text-sm">
                                    {getMethodDisplayName(method)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {method === 'bank_transfer' ? 'Bank Account' : 'Mobile Payment'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Payment Method Details */}
                      <div className="border-t border-gray-200 pt-4 sm:pt-6">
                        {['bkash', 'nagad', 'rocket'].includes(formData.paymentMethod) && (
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                {getMethodDisplayName(formData.paymentMethod)} Phone Number *
                              </label>
                              <input
                                type="tel"
                                name={`paymentDetails.${formData.paymentMethod}.phoneNumber`}
                                value={formData.paymentDetails[formData.paymentMethod].phoneNumber}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                  formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="01XXXXXXXXX"
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Account Type
                                </label>
                                <select
                                  name={`paymentDetails.${formData.paymentMethod}.accountType`}
                                  value={formData.paymentDetails[formData.paymentMethod].accountType}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                >
                                  <option value="personal">Personal</option>
                                  <option value="merchant">Merchant</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === 'binance' && (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Binance Email *
                                </label>
                                <input
                                  type="email"
                                  name={`paymentDetails.binance.email`}
                                  value={formData.paymentDetails.binance.email}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="your-email@binance.com"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Binance ID (Optional)
                                </label>
                                <input
                                  type="text"
                                  name={`paymentDetails.binance.binanceId`}
                                  value={formData.paymentDetails.binance.binanceId}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                  placeholder="Your Binance ID"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Wallet Address *
                              </label>
                              <input
                                type="text"
                                name={`paymentDetails.binance.walletAddress`}
                                value={formData.paymentDetails.binance.walletAddress}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                  formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Your Binance wallet address"
                              />
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === 'bank_transfer' && (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Bank Name *
                                </label>
                                <input
                                  type="text"
                                  name={`paymentDetails.bank_transfer.bankName`}
                                  value={formData.paymentDetails.bank_transfer.bankName}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Enter bank name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Account Name *
                                </label>
                                <input
                                  type="text"
                                  name={`paymentDetails.bank_transfer.accountName`}
                                  value={formData.paymentDetails.bank_transfer.accountName}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Account holder name"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Account Number *
                                </label>
                                <input
                                  type="text"
                                  name={`paymentDetails.bank_transfer.accountNumber`}
                                  value={formData.paymentDetails.bank_transfer.accountNumber}
                                  onChange={handleInputChange}
                                  className={`w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                    formErrors.paymentDetails ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Account number"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  Branch Name
                                </label>
                                <input
                                  type="text"
                                  name={`paymentDetails.bank_transfer.branchName`}
                                  value={formData.paymentDetails.bank_transfer.branchName}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                  placeholder="Branch name"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {formErrors.paymentDetails && (
                        <div className="bg-red-50 border border-red-200 rounded-[5px] p-3 sm:p-4 mt-3 sm:mt-4">
                          <p className="text-red-700 text-xs sm:text-sm flex items-center">
                            <FaExclamationCircle className="mr-2 text-xs sm:text-sm" />
                            {formErrors.paymentDetails}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-[5px] text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Previous
                      </button>
                    )}
                  </div>
                  
                  <div>
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-xs sm:text-sm bg-green-500 text-white rounded-[5px] hover:bg-green-600 transition-colors font-medium shadow-sm"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            Creating Account...
                          </span>
                        ) : (
                          'Create Master Affiliate Account'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MasterAffiliateRegister;