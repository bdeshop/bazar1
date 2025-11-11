import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaUser, FaPhone, FaEnvelope, FaMoneyBill, FaIdCard, FaBell, FaPalette, FaUsers, FaChartLine, FaHistory, FaCreditCard, FaGift, FaCog, FaStar } from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Edituserdetails = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [user, setUser] = useState({
    username: '',
    email: '',
    phone: '',
    player_id: '',
    role: 'user',
    status: 'active',
    currency: 'BDT',
    balance: 0,
    bonusBalance: 0,
    kycStatus: 'unverified',
    isEmailVerified: false,
    isPhoneVerified: false,
    themePreference: 'dark',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        const response = await axios.get(`${base_url}/api/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUser(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch user data');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, base_url]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notification.')) {
      const field = name.split('.')[1];
      setUser(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [field]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setUser(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setUser(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setUser(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('adminToken');
      
      const response = await axios.put(`${base_url}/api/admin/users/${id}`, user, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess('User updated successfully!');
      setUser(response.data.user);
      
      // Auto hide success message
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Function to get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  // Function to get random background color based on username
  const getAvatarColor = (username) => {
    const colors = [
      'from-purple-500 to-pink-500', 
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-emerald-500', 
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-blue-600'
    ];
    if (!username) return colors[0];
    
    const charCode = username.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Format currency
  const formatCurrency = (amount, currency = 'BDT') => {
    if (amount === undefined || amount === null) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Status badge colors with gradients
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-gradient-to-r from-green-500 to-emerald-600',
      inactive: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      suspended: 'bg-gradient-to-r from-red-500 to-rose-600',
      banned: 'bg-gradient-to-r from-gray-500 to-gray-700',
      pending: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    };
    return statusConfig[status] || 'bg-gradient-to-r from-gray-500 to-gray-700';
  };

  // KYC status badge colors
  const getKycBadge = (status) => {
    const kycConfig = {
      verified: 'bg-gradient-to-r from-green-500 to-emerald-600',
      pending: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      unverified: 'bg-gradient-to-r from-red-500 to-rose-600',
      rejected: 'bg-gradient-to-r from-gray-500 to-gray-700'
    };
    return kycConfig[status] || 'bg-gradient-to-r from-gray-500 to-gray-700';
  };

  if (loading) {
    return (
      <section className="font-nunito h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-[90vh]">
              <div className="relative flex justify-center items-center flex-col">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading user data...</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (error && !user.username) {
    return (
      <section className="font-nunito h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-2xl mb-4">Error</div>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => navigate('/admin/users')} 
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg border border-orange-600"
                >
                  Back to Users
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="font-nunito h-screen 0">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`transition-all duration-300 font-poppins flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
          <div className="w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage user account details and settings</p>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-[5px] border border-orange-600 hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium flex items-center">
                  <FaStar className="mr-2" />
                  {success}
                </p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium flex items-center">
                  {error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Info & Financial Boxes */}
              <div className="lg:col-span-2 space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className={`h-20 w-20 rounded-xl flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-br ${getAvatarColor(user.username)}`}>
                      {getUserInitials(user.username)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                      <p className="text-sm text-gray-600 mt-1">Player ID: {user.player_id}</p>
                      <div className="flex space-x-3 mt-3">
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadge(user.status)} text-white`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getKycBadge(user.kycStatus)} text-white`}>
                          KYC: {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FaUser className="inline mr-3 text-blue-500" />
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none  bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FaEnvelope className="inline mr-3 text-purple-500" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={user.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none  bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FaPhone className="inline mr-3 text-green-500" />
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={user.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={user.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none  bg-white transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Overview Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Balance Box */}
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl p-5 text-white border border-blue-600">
                    <div className="flex items-center justify-between mb-4">
                      <FaMoneyBill className="text-2xl opacity-90" />
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Main Balance</span>
                    </div>
                    <div className="mt-2">
                      <input
                        type="number"
                        name="balance"
                        value={user.balance}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none text-2xl font-bold text-white focus:outline-none focus:ring-0 placeholder-white/80"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <p className="text-blue-100 text-sm mt-1 font-medium">{user.currency}</p>
                    </div>
                  </div>

                  {/* Bonus Balance Box */}
                  <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-xl p-5 text-white border border-emerald-600">
                    <div className="flex items-center justify-between mb-4">
                      <FaGift className="text-2xl opacity-90" />
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Bonus Balance</span>
                    </div>
                    <div className="mt-2">
                      <input
                        type="number"
                        name="bonusBalance"
                        value={user.bonusBalance}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none text-2xl font-bold text-white focus:outline-none focus:ring-0 placeholder-white/80"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <p className="text-green-100 text-sm mt-1 font-medium">{user.currency}</p>
                    </div>
                  </div>

                  {/* Referral Earnings Box */}
                  <div className="bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-xl p-5 text-white border border-purple-600">
                    <div className="flex items-center justify-between mb-4">
                      <FaUsers className="text-2xl opacity-90" />
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Referral Earnings</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-2xl font-bold">
                        {formatCurrency(user.referralEarnings || 0)}
                      </p>
                      <p className="text-purple-100 text-sm mt-1 font-medium">{user.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Financial Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaChartLine className="mr-3 text-blue-500" />
                      Financial Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Total Deposit:</span>
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(user.total_deposit)} {user.currency}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Total Withdraw:</span>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(user.total_withdraw)} {user.currency}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Total Bet:</span>
                        <span className="text-sm font-bold text-purple-600">{formatCurrency(user.total_bet)} {user.currency}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Net Profit:</span>
                        <span className={`text-sm font-bold ${(user.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(user.net_profit)} {user.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaHistory className="mr-3 text-green-500" />
                      Account Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Login Count:</span>
                        <span className="text-sm font-bold text-gray-800">{user.login_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Referral Count:</span>
                        <span className="text-sm font-bold text-gray-800">{user.referralCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Last Login:</span>
                        <span className="text-sm font-bold text-gray-800">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Registered:</span>
                        <span className="text-sm font-bold text-gray-800">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Settings & Preferences */}
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <FaCog className="mr-3 text-orange-500" />
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Email Verified</span>
                        <p className="text-xs text-gray-500">User email verification status</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isEmailVerified"
                          checked={user.isEmailVerified}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Phone Verified</span>
                        <p className="text-xs text-gray-500">User phone verification status</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPhoneVerified"
                          checked={user.isPhoneVerified}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={user.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all"
                      >
                        <option value="BDT">BDT</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <FaBell className="mr-3 text-purple-500" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Email Notifications</span>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification.email"
                          checked={user.notificationPreferences?.email || false}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">SMS Notifications</span>
                        <p className="text-xs text-gray-500">Receive updates via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification.sms"
                          checked={user.notificationPreferences?.sms || false}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Push Notifications</span>
                        <p className="text-xs text-gray-500">Receive push notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notification.push"
                          checked={user.notificationPreferences?.push || false}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Preferences */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <FaPalette className="mr-3 text-pink-500" />
                    Theme Preference
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        name="themePreference"
                        value="light"
                        checked={user.themePreference === 'light'}
                        onChange={handleInputChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Light Mode</span>
                        <p className="text-xs text-gray-500">Clean and bright interface</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        name="themePreference"
                        value="dark"
                        checked={user.themePreference === 'dark'}
                        onChange={handleInputChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Dark Mode</span>
                        <p className="text-xs text-gray-500">Easy on the eyes</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        name="themePreference"
                        value="auto"
                        checked={user.themePreference === 'auto'}
                        onChange={handleInputChange}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Auto (System)</span>
                        <p className="text-xs text-gray-500">Follows system settings</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Referral Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <FaUsers className="mr-3 text-cyan-500" />
                    Referral Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Referral Code
                      </label>
                      <input
                        type="text"
                        value={user.referralCode || 'N/A'}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Referral Count
                        </label>
                        <input
                          type="text"
                          value={user.referralCount || 0}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Referral Earnings
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(user.referralEarnings || 0)}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Edituserdetails;