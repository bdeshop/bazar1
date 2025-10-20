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
  FaCrown,
  FaUsers,
  FaPercentage,
  FaCoins,
  FaStar,
  FaRocket
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
  
  // Master Affiliate Profile states
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    masterCode: '',
    customMasterCode: '',
    commissionRate: 0,
    depositRate: 0,
    cpaRate: 0,
    commissionType: 'revenue_share',
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalSubAffiliates: 0,
    activeSubAffiliates: 0,
    paymentMethod: 'bkash',
    formattedPaymentDetails: {},
    isVerified: false,
    lastLogin: '',
    minimumPayout: 2000,
    joinDate: '',
    status: 'active',
    overrideCommission: 0,
    verificationStatus: 'unverified'
  });

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'bkash',
    bkash: { phoneNumber: '', accountType: 'personal' },
    nagad: { phoneNumber: '', accountType: 'personal' },
    rocket: { phoneNumber: '', accountType: 'personal' },
    binance: { email: '', walletAddress: '', binanceId: '' },
    bank_transfer: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      branchName: '',
      routingNumber: '',
      swiftCode: ''
    }
  });

  // Commission settings state
  const [commissionSettings, setCommissionSettings] = useState({
    commissionRate: 0,
    depositRate: 0,
    commissionType: 'revenue_share',
    cpaRate: 0,
    overrideCommission: 0
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
    earningsThisMonth: 0,
    monthlyGrowth: 0,
    totalSubAffiliates: 0,
    activeSubAffiliates: 0,
    conversionRate: 0,
    averageEarningPerSub: 0,
    commissionRate: 0,
    overrideCommission: 0,
    availableForPayout: 0,
    canRequestPayout: false,
    minimumPayout: 2000
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load master affiliate data from localStorage
  useEffect(() => {
    const masterAffiliateData = localStorage.getItem('masterAffiliate');
    if (masterAffiliateData) {
      const parsedData = JSON.parse(masterAffiliateData);
      setProfile(parsedData);
      
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

      // Set commission settings
      setCommissionSettings({
        commissionRate: parsedData.commissionRate || 0,
        depositRate: parsedData.depositRate || 0,
        commissionType: parsedData.commissionType || 'revenue_share',
        cpaRate: parsedData.cpaRate || 0,
        overrideCommission: parsedData.masterEarnings?.overrideCommission || 0
      });
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.get(`${base_url}/api/master-affiliate/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.put(`${base_url}/api/master-affiliate/profile`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        company: profile.company,
        website: profile.website
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedProfile = { ...profile, ...response.data.affiliate };
        localStorage.setItem('masterAffiliate', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCommissionUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.put(`${base_url}/api/master-affiliate/profile/commission`, 
        commissionSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedProfile = {
          ...profile,
          commissionRate: commissionSettings.commissionRate,
          depositRate: commissionSettings.depositRate,
          commissionType: commissionSettings.commissionType,
          cpaRate: commissionSettings.cpaRate,
          masterEarnings: {
            ...profile.masterEarnings,
            overrideCommission: commissionSettings.overrideCommission
          }
        };
        localStorage.setItem('masterAffiliate', JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        toast.success('Commission settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating commission settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update commission settings');
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const currentMethod = paymentDetails.paymentMethod;
      
      const response = await axios.put(`${base_url}/api/master-affiliate/profile/payment`, {
        paymentMethod: currentMethod,
        paymentDetails: paymentDetails[currentMethod],
        minimumPayout: profile.minimumPayout,
        payoutSchedule: profile.payoutSchedule,
        autoPayout: profile.autoPayout
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const updatedProfile = {
          ...profile,
          paymentMethod: response.data.paymentDetails.paymentMethod,
          formattedPaymentDetails: response.data.paymentDetails.formattedPaymentDetails,
          minimumPayout: response.data.paymentDetails.minimumPayout,
          payoutSchedule: response.data.paymentDetails.payoutSchedule,
          autoPayout: response.data.paymentDetails.autoPayout
        };
        localStorage.setItem('masterAffiliate', JSON.stringify(updatedProfile));
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
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.put(`${base_url}/api/master-affiliate/profile/change-password`, 
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const getGradientClass = (type) => {
    const gradients = {
      primary: 'from-purple-600 via-pink-600 to-blue-600',
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-amber-500 to-orange-600',
      danger: 'from-rose-500 to-red-600',
      info: 'from-cyan-500 to-blue-600',
      premium: 'from-violet-600 to-purple-700'
    };
    return `bg-gradient-to-br ${gradients[type] || gradients.primary}`;
  };

  const statsCards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(dashboardStats.totalEarnings),
      subtext: 'Lifetime earnings',
      icon: FaCoins,
      gradient: 'gold',
      bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600'
    },
    {
      title: 'Pending Earnings',
      value: formatCurrency(dashboardStats.pendingEarnings),
      subtext: `Min. payout: ${formatCurrency(dashboardStats.minimumPayout)}`,
      icon: FaMoneyBillWave,
      gradient: 'warning',
      bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600'
    },
    {
      title: 'Sub-Affiliates',
      value: dashboardStats.totalSubAffiliates,
      subtext: `${dashboardStats.activeSubAffiliates} active`,
      icon: FaUsers,
      gradient: 'success',
      bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-600'
    },
    {
      title: 'Override Commission',
      value: `${dashboardStats.overrideCommission}%`,
      subtext: 'From sub-affiliates',
      icon: FaCrown,
      gradient: 'premium',
      bgColor: 'bg-gradient-to-r from-violet-600 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-10">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-[25px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Master Affiliate Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 text-[15px] font-medium flex items-center">
                    <FaCrown className="text-amber-500 mr-2" />
                    Manage your master account and sub-affiliate network
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 flex items-center space-x-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getGradientClass('premium')} text-white`}>
                        <FaStar className="text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Master Status</p>
                        <p className="font-semibold text-purple-700 capitalize">{profile.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {statsCards.map((stat, index) => (
                <div 
                  key={index} 
                  className={`${stat.bgColor} rounded-[5px] p-6 text-white transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <stat.icon className="text-xl text-white" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/70 text-xs">{stat.subtext}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payout Alert */}
            <div className={`rounded-[5px] p-6 mb-10 text-white ${
              dashboardStats.canRequestPayout 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {dashboardStats.canRequestPayout ? 
                      <FaCheckCircle className="text-2xl" /> : 
                      <FaExclamationTriangle className="text-2xl" />
                    }
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Payout Status</h3>
                    <p className="opacity-90 text-sm">
                      {dashboardStats.canRequestPayout 
                        ? `You're eligible to request a payout of ${formatCurrency(dashboardStats.pendingEarnings)}`
                        : `You need ${formatCurrency(dashboardStats.minimumPayout - dashboardStats.pendingEarnings)} more to be eligible for payout`
                      }
                    </p>
                  </div>
                </div>
                {dashboardStats.canRequestPayout && (
                  <button className="mt-4 lg:mt-0 px-6 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                    Request Payout
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-[5px] border border-gray-200 overflow-hidden">
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
                          ? 'border-purple-600 text-purple-700 font-semibold'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`text-lg ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Master Profile Information</h2>
                        <p className="text-gray-600 text-[13px] mt-1">Manage your personal and business details</p>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`mt-4 lg:mt-0 px-6 py-3 rounded-xl font-[500] text-[13px] cursor-pointer transition-all duration-300 flex items-center space-x-2 ${
                          isEditing
                            ? 'bg-gray-500 text-white hover:bg-gray-600'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={profile.lastName}
                              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              disabled={!isEditing}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                              placeholder="https://example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Master Code</label>
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                value={profile.masterCode}
                                disabled
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-[5px] bg-gray-100 text-gray-500 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(profile.masterCode)}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[5px] cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] bg-gray-100 text-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[5px] font-[500] hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2 cursor-pointer"
                          >
                            <FaSave />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Commission Settings Tab */}
                {activeTab === 'commission' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-[600] text-gray-900">Commission Settings</h2>
                      <p className="text-gray-600 text-[13px] mt-1">Configure your commission rates and override settings</p>
                    </div>

                    <form onSubmit={handleCommissionUpdate} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Commission Rates</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={commissionSettings.commissionRate}
                              onChange={(e) => setCommissionSettings({
                                ...commissionSettings,
                                commissionRate: parseFloat(e.target.value)
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Rate (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={commissionSettings.depositRate}
                              onChange={(e) => setCommissionSettings({
                                ...commissionSettings,
                                depositRate: parseFloat(e.target.value)
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CPA Rate (BDT)</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={commissionSettings.cpaRate}
                              onChange={(e) => setCommissionSettings({
                                ...commissionSettings,
                                cpaRate: parseFloat(e.target.value)
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Master Settings</h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
                            <select
                              value={commissionSettings.commissionType}
                              onChange={(e) => setCommissionSettings({
                                ...commissionSettings,
                                commissionType: e.target.value
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            >
                              <option value="revenue_share">Revenue Share</option>
                              <option value="cpa">CPA</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Override Commission (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={commissionSettings.overrideCommission}
                              onChange={(e) => setCommissionSettings({
                                ...commissionSettings,
                                overrideCommission: parseFloat(e.target.value)
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            />
                            <p className="text-xs text-gray-500 mt-1">Percentage you earn from sub-affiliate commissions</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[10px] hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2 font-[500] text-[14px]"
                        >
                          <span>Update Commission Settings</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-[600] text-gray-900">Payment Settings</h2>
                      <p className="text-gray-600 text-[13px] mt-1">Configure how you receive your master affiliate earnings</p>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                            <option value="binance">Binance</option>
                            <option value="bank_transfer">Bank Transfer</option>
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
                                placeholder="01XXXXXXXXX"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>
                          </>
                        )}

                        {paymentDetails.paymentMethod === 'bank_transfer' && (
                          <>
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                              <input
                                type="text"
                                value={paymentDetails.bank_transfer?.bankName || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  bank_transfer: {
                                    ...paymentDetails.bank_transfer,
                                    bankName: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                              <input
                                type="text"
                                value={paymentDetails.bank_transfer?.accountName || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  bank_transfer: {
                                    ...paymentDetails.bank_transfer,
                                    accountName: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>

                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                              <input
                                type="text"
                                value={paymentDetails.bank_transfer?.accountNumber || ''}
                                onChange={(e) => setPaymentDetails({
                                  ...paymentDetails,
                                  bank_transfer: {
                                    ...paymentDetails.bank_transfer,
                                    accountNumber: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[10px] hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2 font-[500] text-[14px]"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 pr-12"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 pr-12"
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 pr-12"
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
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[10px] cursor-pointer font-[500] hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2 text-[15px]"
                        >
                          <span>Update Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="px-6 py-3 bg-gray-500 text-white rounded-[10px] cursor-pointer hover:bg-gray-700 text-[15px] font-[500] transition-colors"
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