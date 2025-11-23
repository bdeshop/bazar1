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

  // Load payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.get(`${base_url}/api/affiliate/profile`, {
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

  const updatePaymentMethod = async (methodData) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.put(`${base_url}/api/affiliate/profile/payment`, 
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
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 transition-all font-poppins duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="px-[30px] py-[60px]">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl  font-[600] text-gray-900">
                    Payment Methods
                  </h1>
                  <p className="text-gray-600  mt-1 text-[12px]">
                    Manage your affiliate earnings payment methods
                  </p>
                </div>
                <button
                  onClick={() => handleOpenForm('add')}
                  className="mt-3 lg:mt-0 px-4 py-2 bg-green-600 text-white rounded-[5px] hover:bg-green-600 transition-colors flex items-center space-x-1 text-[14px] font-[500] cursor-pointer"
                >
                  <span>Add Method</span>
                </button>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              {Object.entries(paymentMethods.methods).map(([method, details]) => {
                const IconComponent = getMethodIcon(method);
                const isPrimary = details.isPrimary;
                const hasDetails = hasMethodDetails(method, details);

                return (
                  <div
                    key={method}
                    className={`bg-white rounded-lg p-4 shadow cursor-pointer border transition-all duration-300 cursor-pointer hover:shadow-md ${
                      activeMethod === method 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    } ${isPrimary ? 'ring-1 ring-green-500 ring-opacity-50' : ''}`}
                    onClick={() => setActiveMethod(method)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${
                          activeMethod === method ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="text-base" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {getMethodDisplayName(method)}
                          </h3>
                          {isPrimary && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                              <FaCheckCircle className="w-2 h-2 mr-1" />
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                      {!isPrimary && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsPrimary(method);
                          }}
                          className="text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>

                    {hasDetails ? (
                      <div className="space-y-1 text-xs text-gray-600">
                        {['bkash', 'nagad', 'rocket'].includes(method) ? (
                          <>
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <span className="font-mono">{formatPhoneNumber(details.phoneNumber)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize">{details.accountType}</span>
                            </div>
                          </>
                        ) : method === 'binance' ? (
                          <>
                            {details.email && (
                              <div className="truncate">
                                <span className="block truncate">{details.email}</span>
                              </div>
                            )}
                            {details.walletAddress && (
                              <div className="truncate">
                                <span className="font-mono text-xs truncate block">
                                  {details.walletAddress.slice(0, 16)}...
                                </span>
                              </div>
                            )}
                          </>
                        ) : method === 'bank_transfer' ? (
                          <>
                            <div className="flex justify-between">
                              <span>Account:</span>
                              <span className="font-mono">{maskAccountNumber(details.accountNumber)}</span>
                            </div>
                            <div className="truncate">
                              <span className="block truncate">{details.bankName}</span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="text-gray-400 mb-1">
                          <IconComponent className="text-xl mx-auto" />
                        </div>
                        <p className="text-gray-500 text-xs">Not configured</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm('edit', method);
                          }}
                          className="mt-1 text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          Set up
                        </button>
                      </div>
                    )}

                    {hasDetails && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenForm('edit', method);
                          }}
                          className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center space-x-1"
                        >
                          <FaEdit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment Method Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-[600] text-gray-900">
                    {formMode === 'add' ? 'Add Payment Method' : `Edit ${getMethodDisplayName(formData.type)}`}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-base" />
                  </button>
                </div>

                <div className="space-y-4">
                  {formMode === 'add' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Payment Method Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="--- --- ---"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Binance Email
                        </label>
                        <input
                          type="email"
                          placeholder="your-email@binance.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Wallet Address
                        </label>
                        <input
                          type="text"
                          placeholder="Your Binance wallet address"
                          value={formData.walletAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Binance ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Your Binance ID"
                          value={formData.binanceId}
                          onChange={(e) => setFormData(prev => ({ ...prev, binanceId: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'bank_transfer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="Bank name"
                            value={formData.bankName}
                            onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Account Name
                          </label>
                          <input
                            type="text"
                            placeholder="Account holder name"
                            value={formData.accountName}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="Account number"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Branch Name
                          </label>
                          <input
                            type="text"
                            placeholder="Branch name"
                            value={formData.branchName}
                            onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            placeholder="Routing number"
                            value={formData.routingNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            SWIFT Code
                          </label>
                          <input
                            type="text"
                            placeholder="SWIFT code"
                            value={formData.swiftCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, swiftCode: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-[5px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-2 pt-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-4 py-2 font-[500] text-[14px] bg-green-500 text-white rounded-[5px] cursor-pointer hover:bg-green-600 transition-colors cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      disabled={isSaving}
                      className="px-4 py-2 text-[14px] bg-gray-500 text-white rounded-[5px] cursor-pointer hover:bg-gray-600 transition-colors font-semibold"
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