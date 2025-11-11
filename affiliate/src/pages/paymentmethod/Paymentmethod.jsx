import React, { useState, useEffect } from 'react';
import { 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity, 
  FaBitcoin, 
  FaCheckCircle,
  FaEdit,
  FaPlus,
  FaTrash,
  FaExclamationTriangle,
  FaCrown,
  FaCoins,
  FaWallet
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaTimes } from "react-icons/fa";

const Paymentmethod = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('edit'); // 'add' or 'edit'
  const [activeMethod, setActiveMethod] = useState('bkash');
  const [isSaving, setIsSaving] = useState(false);

  // Payment methods state
  const defaultMethods = {
    bkash: {
      phoneNumber: '',
      accountType: 'personal',
      isVerified: false,
      isPrimary: false
    },
    nagad: {
      phoneNumber: '',
      accountType: 'personal',
      isVerified: false,
      isPrimary: false
    },
    rocket: {
      phoneNumber: '',
      accountType: 'personal',
      isVerified: false,
      isPrimary: false
    },
    binance: {
      email: '',
      walletAddress: '',
      binanceId: '',
      isVerified: false,
      isPrimary: false
    },
    bank_transfer: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      branchName: '',
      routingNumber: '',
      swiftCode: '',
      isVerified: false,
      isPrimary: false
    }
  };

  const [paymentMethods, setPaymentMethods] = useState({
    currentMethod: 'bkash',
    methods: defaultMethods
  });

  // Payout settings state
  const [payoutSettings, setPayoutSettings] = useState({
    minimumPayout: 2000,
    payoutSchedule: 'manual',
    autoPayout: false
  });

  // Form data for add/edit
  const [formData, setFormData] = useState({
    type: 'bkash',
    phoneNumber: '',
    accountType: 'personal',
    email: '',
    walletAddress: '',
    binanceId: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    routingNumber: '',
    swiftCode: ''
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load payment methods and payout settings
  useEffect(() => {
    loadPaymentMethods();
    loadPayoutSettings();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.get(`${base_url}/api/master-affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const profile = response.data.affiliate;
        setPaymentMethods({
          currentMethod: profile.paymentMethod,
          methods: {
            ...defaultMethods,
            [profile.paymentMethod]: {
              ...defaultMethods[profile.paymentMethod],
              ...profile.formattedPaymentDetails,
              isPrimary: true
            }
          }
        });
        setActiveMethod(profile.paymentMethod);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayoutSettings = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.get(`${base_url}/api/master-affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const profile = response.data.affiliate;
        setPayoutSettings({
          minimumPayout: profile.minimumPayout || 2000,
          payoutSchedule: profile.payoutSchedule || 'manual',
          autoPayout: profile.autoPayout || false
        });
      }
    } catch (error) {
      console.error('Error loading payout settings:', error);
    }
  };

  const updatePaymentMethod = async (methodData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.put(`${base_url}/api/master-affiliate/profile/payment`, 
        methodData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Payment method updated successfully!');
        setShowForm(false);
        await loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePayoutSettings = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.put(`${base_url}/api/master-affiliate/profile/payment`, 
        {
          paymentMethod: paymentMethods.currentMethod,
          paymentDetails: paymentMethods.methods[paymentMethods.currentMethod],
          minimumPayout: payoutSettings.minimumPayout,
          payoutSchedule: payoutSettings.payoutSchedule,
          autoPayout: payoutSettings.autoPayout
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Payout settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating payout settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update payout settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenForm = (mode, method = 'bkash') => {
    if (mode === 'add') {
      setFormData({
        type: 'bkash',
        phoneNumber: '',
        accountType: 'personal',
        email: '',
        walletAddress: '',
        binanceId: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchName: '',
        routingNumber: '',
        swiftCode: ''
      });
    } else {
      setActiveMethod(method);
      setFormData({
        type: method,
        ...paymentMethods.methods[method]
      });
    }
    setFormMode(mode);
    setShowForm(true);
  };

  const handleSave = () => {
    const type = formMode === 'add' ? formData.type : activeMethod;
    const details = getPaymentDetailsForType(type);

    if (!validateForm(type, details)) {
      return;
    }

    const methodData = {
      paymentMethod: type,
      paymentDetails: details
    };

    updatePaymentMethod(methodData);
  };

  const validateForm = (type, details) => {
    let valid = true;
    switch (type) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        if (!details.phoneNumber || details.phoneNumber.length < 10) {
          toast.error('Please enter a valid phone number');
          valid = false;
        }
        break;
      case 'binance':
        if (!details.email || !/\S+@\S+\.\S+/.test(details.email)) {
          toast.error('Please enter a valid email');
          valid = false;
        }
        if (!details.walletAddress) {
          toast.error('Please enter wallet address');
          valid = false;
        }
        break;
      case 'bank_transfer':
        if (!details.bankName || !details.accountName || !details.accountNumber) {
          toast.error('Please fill required bank details');
          valid = false;
        }
        break;
      default:
        valid = false;
    }
    return valid;
  };

  const getPaymentDetailsForType = (type) => {
    switch (type) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return {
          phoneNumber: formData.phoneNumber,
          accountType: formData.accountType
        };
      case 'binance':
        return {
          email: formData.email,
          walletAddress: formData.walletAddress,
          binanceId: formData.binanceId
        };
      case 'bank_transfer':
        return {
          bankName: formData.bankName,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          branchName: formData.branchName,
          routingNumber: formData.routingNumber,
          swiftCode: formData.swiftCode
        };
      default:
        return {};
    }
  };

  const setAsPrimary = (methodType) => {
    const details = paymentMethods.methods[methodType];
    if (!hasMethodDetails(methodType, details)) {
      toast.info('Please set up the method first');
      handleOpenForm('edit', methodType);
      return;
    }

    setPaymentMethods(prev => {
      const updatedMethods = { ...prev.methods };
      Object.keys(updatedMethods).forEach(key => {
        updatedMethods[key].isPrimary = false;
      });
      updatedMethods[methodType].isPrimary = true;
      return {
        currentMethod: methodType,
        methods: updatedMethods
      };
    });
    
    setActiveMethod(methodType);
    updatePaymentMethod({
      paymentMethod: methodType,
      paymentDetails: details
    });
  };

  const hasMethodDetails = (type, details) => {
    switch (type) {
      case 'bkash':
      case 'nagad':
      case 'rocket':
        return !!details.phoneNumber;
      case 'binance':
        return !!details.email || !!details.walletAddress;
      case 'bank_transfer':
        return !!details.accountNumber;
      default:
        return false;
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
      bank_transfer: FaUniversity
    };
    return icons[method] || FaCreditCard;
  };

  const getMethodColor = (method) => {
    const colors = {
      bkash: 'from-pink-500 to-red-500',
      nagad: 'from-green-500 to-emerald-500',
      rocket: 'from-blue-500 to-cyan-500',
      binance: 'from-yellow-500 to-amber-500',
      bank_transfer: 'from-purple-500 to-indigo-500'
    };
    return colors[method] || 'from-gray-500 to-gray-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not set';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  const maskAccountNumber = (account) => {
    if (!account) return 'Not set';
    return `****${account.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-16">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`flex-1 p-6 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 transition-all font-poppins duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Payment Methods
                  </h1>
                  <p className="text-gray-600 mt-2 text-sm flex items-center">
                    <FaCrown className="text-amber-500 mr-2" />
                    Manage your master affiliate earnings payment methods
                  </p>
                </div>
                <button
                  onClick={() => handleOpenForm('add')}
                  className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[5px] hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 text-sm font-medium  cursor-pointer transform hover:scale-105"
                >
                  <span>Add Payment Method</span>
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Current Method</p>
                    <p className="text-2xl font-bold mt-1">{getMethodDisplayName(paymentMethods.currentMethod)}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaWallet className="text-xl text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Minimum Payout</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(payoutSettings.minimumPayout)}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaCoins className="text-xl text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Payout Schedule</p>
                    <p className="text-2xl font-bold mt-1 capitalize">{payoutSettings.payoutSchedule.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaShieldAlt className="text-xl text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              {Object.entries(paymentMethods.methods).map(([method, details]) => {
                const IconComponent = getMethodIcon(method);
                const isPrimary = details.isPrimary;
                const hasDetails = hasMethodDetails(method, details);
                const colorClass = getMethodColor(method);

                return (
                  <div
                    key={method}
                    className={`bg-white rounded-[5px] p-6  border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                      activeMethod === method 
                        ? `border-purple-500 bg-gradient-to-br ${colorClass} text-white` 
                        : 'border-gray-200 hover:border-purple-300'
                    } ${isPrimary ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                    onClick={() => setActiveMethod(method)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${
                          activeMethod === method ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="text-lg" />
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm ${
                            activeMethod === method ? 'text-white' : 'text-gray-900'
                          }`}>
                            {getMethodDisplayName(method)}
                          </h3>
                          {isPrimary && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              activeMethod === method ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'
                            }`}>
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                      {!isPrimary && hasDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsPrimary(method);
                          }}
                          className={`text-xs font-medium ${
                            activeMethod === method ? 'text-white/90 hover:text-white' : 'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          Set Primary
                        </button>
                      )}
                    </div>

                    {hasDetails ? (
                      <div className={`space-y-2 text-sm ${
                        activeMethod === method ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {['bkash', 'nagad', 'rocket'].includes(method) ? (
                          <>
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <span className="font-mono font-semibold">{formatPhoneNumber(details.phoneNumber)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize font-semibold">{details.accountType}</span>
                            </div>
                          </>
                        ) : method === 'binance' ? (
                          <>
                            {details.email && (
                              <div className="truncate">
                                <span className="block truncate font-semibold">{details.email}</span>
                              </div>
                            )}
                            {details.walletAddress && (
                              <div className="truncate">
                                <span className="font-mono text-xs truncate block font-semibold">
                                  {details.walletAddress.slice(0, 16)}...
                                </span>
                              </div>
                            )}
                          </>
                        ) : method === 'bank_transfer' ? (
                          <>
                            <div className="flex justify-between">
                              <span>Account:</span>
                              <span className="font-mono font-semibold">{maskAccountNumber(details.accountNumber)}</span>
                            </div>
                            <div className="truncate">
                              <span className="block truncate font-semibold">{details.bankName}</span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <div className={`mb-2 ${
                          activeMethod === method ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          <IconComponent className="text-2xl mx-auto" />
                        </div>
                        <p className={`text-sm ${
                          activeMethod === method ? 'text-white/80' : 'text-gray-500'
                        }`}>Not configured</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm('edit', method);
                          }}
                          className={`mt-2 text-sm font-medium ${
                            activeMethod === method ? 'text-white hover:text-white/90' : 'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          Set up now
                        </button>
                      </div>
                    )}

                    {hasDetails && (
                      <div className="mt-4 pt-3 border-t border-gray-200 border-opacity-30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm('edit', method);
                          }}
                          className={`text-sm font-medium flex items-center space-x-2 ${
                            activeMethod === method ? 'text-white/90 hover:text-white' : 'text-purple-600 hover:text-purple-700'
                          }`}
                        >
                          <FaEdit className="w-3 h-3" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>


            {/* Payment Method Form */}
            {showForm && (
              <div className="bg-white rounded-[5px] shadow-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {formMode === 'add' ? 'Add Payment Method' : `Edit ${getMethodDisplayName(formData.type)}`}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>

                <div className="space-y-6">
                  {formMode === 'add' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      >
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">Rocket</option>
                        <option value="binance">Binance</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                  )}

                  {['bkash', 'nagad', 'rocket'].includes(formData.type) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="--- --- ---"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Type
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        >
                          <option value="personal">Personal</option>
                          <option value="merchant">Merchant</option>
                        </select>
                      </div>
                    </>
                  )}

                  {formData.type === 'binance' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Binance Email
                        </label>
                        <input
                          type="email"
                          placeholder="your-email@binance.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          placeholder="Your Binance wallet address"
                          value={formData.walletAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Binance ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Your Binance ID"
                          value={formData.binanceId}
                          onChange={(e) => setFormData(prev => ({ ...prev, binanceId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'bank_transfer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="Bank name"
                            value={formData.bankName}
                            onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name
                          </label>
                          <input
                            type="text"
                            placeholder="Account holder name"
                            value={formData.accountName}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="Account number"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Name
                          </label>
                          <input
                            type="text"
                            placeholder="Branch name"
                            value={formData.branchName}
                            onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            placeholder="Routing number"
                            value={formData.routingNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SWIFT Code
                          </label>
                          <input
                            type="text"
                            placeholder="SWIFT code"
                            value={formData.swiftCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, swiftCode: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[5px] hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 text-sm font-medium cursor-pointer ${
                        isSaving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Payment Method'}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-colors text-sm font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Paymentmethod;