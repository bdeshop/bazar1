import React, { useState, useEffect } from 'react';
import { 
  FaEdit, 
  FaSave, 
  FaLock, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUser, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCopy,
  FaCreditCard,
  FaShieldAlt,
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile states
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    affiliateCode: '',
    commissionRate: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    referralCount: 0,
    paymentMethod: 'bkash',
    formattedPaymentDetails: {},
    isVerified: false,
    lastLogin: '',
    minimumPayout: 1000,
    joinDate: '',
    status: 'active'
  });

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'bkash',
    bkash: { phoneNumber: '', accountType: 'personal' },
    nagad: { phoneNumber: '', accountType: 'personal' },
    rocket: { phoneNumber: '', accountType: 'personal' },
    binance: { email: '', walletAddress: '', binanceId: '' }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    referralCount: 0,
    commissionRate: 0,
    minimumPayout: 1000,
    availableForPayout: 0,
    daysUntilPayout: 0,
    conversionRate: 0,
    monthlyEarnings: 0
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load affiliate data from localStorage
  useEffect(() => {
    const affiliateData = localStorage.getItem('affiliate');
    if (affiliateData) {
      const parsedData = JSON.parse(affiliateData);
      setProfile({ ...parsedData, minimumPayout: 1000 });
      
      if (parsedData.formattedPaymentDetails) {
        setPaymentDetails(prev => ({
          ...prev,
          paymentMethod: parsedData.paymentMethod,
          [parsedData.paymentMethod]: {
            ...prev[parsedData.paymentMethod],
            ...parsedData.formattedPaymentDetails
          }
        }));
      }
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.get(`${base_url}/api/affiliate/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data.success) {
        setDashboardStats({ ...response.data.stats, minimumPayout: 1000 });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.put(`${base_url}/api/affiliate/profile`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        company: profile.company,
        website: profile.website
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedAffiliate = { ...profile, ...response.data.affiliate, minimumPayout: 1000 };
        localStorage.setItem('affiliate', JSON.stringify(updatedAffiliate));
        setProfile(updatedAffiliate);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('affiliatetoken');
      const currentMethod = paymentDetails.paymentMethod;
      
      const response = await axios.put(`${base_url}/api/affiliate/profile/payment`, {
        paymentMethod: currentMethod,
        paymentDetails: paymentDetails[currentMethod]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedProfile = {
          ...profile,
          paymentMethod: response.data.paymentMethod,
          formattedPaymentDetails: response.data.formattedPaymentDetails,
          minimumPayout: 1000
        };
        localStorage.setItem('affiliate', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        toast.success('Payment details updated successfully!');
      }
    } catch (error) {
      console.error('Error updating payment details:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment details');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.put(`${base_url}/api/affiliate/profile/change-password`, 
        passwordData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isEligibleForPayout = dashboardStats.pendingEarnings >= dashboardStats.minimumPayout;

  return (
    <div className="min-h-screen ">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-10">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[25px] font-bold text-gray-900 tracking-tight">
                    Affiliate Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 text-[15px] font-medium">
                    Manage your account and track your earnings
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                  <div className=" p-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Affiliate Status</p>
                        <p className="font-semibold text-green-700 capitalize">{profile.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                {
                  title: 'Pending Earnings',
                  value: formatCurrency(dashboardStats.pendingEarnings),
                  subtext: `Min. payout: ${formatCurrency(dashboardStats.minimumPayout)}`,
                  icon: FaMoneyBillWave,
                  bgColor: 'bg-green-100',
                  textColor: 'text-green-700'
                },
                {
                  title: 'Total Earnings',
                  value: formatCurrency(dashboardStats.totalEarnings),
                  subtext: 'Lifetime earnings',
                  icon: FaChartLine,
                  bgColor: 'bg-blue-100',
                  textColor: 'text-blue-700'
                },
                {
                  title: 'Referrals',
                  value: dashboardStats.referralCount,
                  subtext: 'Active referrals',
                  icon: FaUser,
                  bgColor: 'bg-purple-100',
                  textColor: 'text-purple-700'
                },
                {
                  title: 'Commission Rate',
                  value: `${(dashboardStats.commissionRate * 100).toFixed(1)}%`,
                  subtext: 'Per successful referral',
                  icon: FaLock,
                  bgColor: 'bg-orange-100',
                  textColor: 'text-orange-700'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-[5px] p-6 border border-gray-200 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                      <stat.icon className={`text-xl ${stat.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{stat.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payout Alert */}
            {/* <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 mb-10 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {isEligibleForPayout ? <FaCheckCircle className="text-2xl" /> : <FaExclamationTriangle className="text-2xl" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Payout Status</h3>
                    <p className="opacity-90 text-sm">
                      {isEligibleForPayout 
                        ? `You're eligible to request a payout of ${formatCurrency(dashboardStats.pendingEarnings)}`
                        : `You need ${formatCurrency(dashboardStats.minimumPayout - dashboardStats.pendingEarnings)} more to be eligible for payout`
                      }
                    </p>
                  </div>
                </div>
                {isEligibleForPayout && (
                  <button className="mt-4 lg:mt-0 px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                    Request Payout
                  </button>
                )}
              </div>
            </div> */}

            {/* Main Content Tabs */}
            <div className="bg-white rounded-[5px]  border border-gray-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'profile', label: 'Profile Information', icon: FaUser },
                    { id: 'payment', label: 'Payment Details', icon: FaCreditCard },
                    { id: 'security', label: 'Security', icon: FaShieldAlt }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center cursor-pointer space-x-2 px-6 py-4 border-b-4 transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-green-600 text-green-700  font-semibold'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`text-lg ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:px-5 py-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        <p className="text-gray-600 text-[13px] mt-1">Manage your personal and business details</p>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`mt-4 lg:mt-0 px-6 py-3 rounded-[5px] font-[500] text-[13px] cursor-pointer transition-all duration-300 flex items-center space-x-2 ${
                          isEditing
                            ? 'bg-gray-500 text-white hover:bg-gray-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                      </button>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Details</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={profile.firstName}
                              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={profile.lastName}
                              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] bg-gray-100 text-gray-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                            />
                          </div>
                        </div>

                        {/* Business Information */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 border-gray-200">Business Information</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <input
                              type="text"
                              value={profile.company || ''}
                              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 "
                              placeholder="Your company name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                              type="url"
                              value={profile.website || ''}
                              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100 "
                              placeholder="https://example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Affiliate Code</label>
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                value={profile.affiliateCode}
                                disabled
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-[5px] bg-gray-100 text-gray-500 font-mono "
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(profile.affiliateCode)}
                                className="px-4 py-3 bg-green-600 text-white rounded-[5px] cursor-pointer hover:bg-green-700 transition-colors flex items-center space-x-2 "
                              >
                                <FaCopy />
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                            <input
                              type="text"
                              value={formatDate(profile.lastLogin)}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] bg-gray-100 text-gray-500 "
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            className="px-8 py-3 bg-green-600 text-white rounded-[5px] font-[500] hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
                          >
                            <span>Save Changes</span>
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-[600] text-gray-900">Payment Settings</h2>
                      <p className="text-gray-600 text-[13px] mt-1">Configure how you receive your affiliate earnings</p>
                    </div>

                    <form onSubmit={handlePaymentUpdate} className="space-y-8">
                      <div className="grid grid-cols-1 gap-8">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                          <select
                            value={paymentDetails.paymentMethod}
                            onChange={(e) => setPaymentDetails({
                              ...paymentDetails,
                              paymentMethod: e.target.value
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="binance">Binance</option>
                          </select>
                        </div>

                        {(paymentDetails.paymentMethod === 'bkash' || 
                          paymentDetails.paymentMethod === 'nagad' || 
                          paymentDetails.paymentMethod === 'rocket') && (
                          <>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {paymentDetails.paymentMethod.charAt(0).toUpperCase() + paymentDetails.paymentMethod.slice(1)} Phone Number
                              </label>
                              <input
                                type="tel"
                                value={paymentDetails[paymentDetails.paymentMethod]?.phoneNumber || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  [paymentDetails.paymentMethod]: {
                                    ...paymentDetails[paymentDetails.paymentMethod],
                                    phoneNumber: e.target.value
                                  }
                                })}
                                placeholder="--- --- ---"
                                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 "
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                              <select
                                value={paymentDetails[paymentDetails.paymentMethod]?.accountType || 'personal'}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  [paymentDetails.paymentMethod]: {
                                    ...paymentDetails[paymentDetails.paymentMethod],
                                    accountType: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                              >
                                <option value="personal">Personal</option>
                                <option value="merchant">Merchant</option>
                              </select>
                            </div>
                          </>
                        )}

                        {paymentDetails.paymentMethod === 'binance' && (
                          <>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Binance Email</label>
                              <input
                                type="email"
                                value={paymentDetails.binance?.email || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  binance: {
                                    ...paymentDetails.binance,
                                    email: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                              <input
                                type="text"
                                value={paymentDetails.binance?.walletAddress || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  binance: {
                                    ...paymentDetails.binance,
                                    walletAddress: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Binance ID (Optional)</label>
                              <input
                                type="text"
                                value={paymentDetails.binance?.binanceId || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  binance: {
                                    ...paymentDetails.binance,
                                    binanceId: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-8 py-3 bg-green-600 text-white rounded-[5px]  hover:bg-green-700 transition-colors flex items-center space-x-2 font-[500] text-[14px]"
                        >
                          <span>Update Payment Details</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-[500] text-gray-900">Security Settings</h2>
                      <p className="text-gray-600 text-[13px] mt-1">Manage your account security and password</p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="w-full space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                      
                      <div className="grid grid-cols-1 gap-6 w-full">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-green-600 text-white rounded-[5px] cursor-pointer font-[500] hover:bg-green-700 transition-colors flex items-center space-x-2 text-[15px] "
                        >
                          <span>Update Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="px-6 py-3 bg-gray-500 text-white rounded-[5px] cursor-pointer hover:bg-gray-700 text-[15px] font-[500] transition-colors "
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;