import React, { useState } from 'react';
import { FaUpload, FaTimes, FaEye, FaEyeSlash, FaPhone, FaEnvelope, FaUser, FaIdCard, FaMoneyBill } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";

const Newuser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: null,
    currency: 'BDT',
    role: 'user',
    status: 'active',
    language: 'bn',
    dailyWithdrawalLimit: 50000,
    isEmailVerified: false,
    isPhoneVerified: false,
    kycStatus: 'unverified',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    },
    themePreference: 'dark'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [users, setUsers] = useState([
    {
      _id: { $oid: "68ae24b8c2b1c27dfe6572b2" },
      email: "abusaid@example.com",
      username: "abusaid",
      phone: "+8801612258204",
      avatar: "https://images.5943920202.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png",
      player_id: "PID507954",
      role: "user",
      status: "active",
      language: "bn",
      currency: "BDT",
      balance: 10,
      kycStatus: "unverified",
      createdAt: { $date: "2025-08-26T21:18:48.904Z" },
    },
    {
      _id: { $oid: "68ae24b8c2b1c27dfe6572b3" },
      email: "john.doe@example.com",
      username: "johndoe",
      phone: "+8801712345678",
      avatar: "https://images.5943920202.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/1.png",
      player_id: "PID507955",
      role: "user",
      status: "inactive",
      language: "en",
      currency: "USD",
      balance: 100,
      kycStatus: "verified",
      createdAt: { $date: "2025-08-20T10:15:30.904Z" },
    }
  ]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notification.')) {
      const notificationType = name.split('.')[1];
      setFormData({
        ...formData,
        notificationPreferences: {
          ...formData.notificationPreferences,
          [notificationType]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, avatar: file});
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({...formData, avatar: null});
    setImagePreview(null);
  };

  const generatePlayerId = () => {
    return 'PID' + Math.floor(100000 + Math.random() * 900000);
  };

  const generateReferralCode = () => {
    return 'REF' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    // Generate a unique ID for the new user
    const newId = { $oid: Date.now().toString() };
    
    // Create new user object
    const newUser = {
      _id: newId,
      email: formData.email,
      username: formData.username,
      phone: formData.phone,
      avatar: formData.avatar ? URL.createObjectURL(formData.avatar) : "https://images.5943920202.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png",
      player_id: generatePlayerId(),
      role: formData.role,
      status: formData.status,
      language: formData.language,
      first_login: true,
      login_count: 0,
      currency: formData.currency,
      balance: 0,
      bonusBalance: 0,
      total_deposit: 0,
      total_withdraw: 0,
      total_bet: 0,
      total_wins: 0,
      total_loss: 0,
      net_profit: 0,
      lifetime_deposit: 0,
      lifetime_withdraw: 0,
      lifetime_bet: 0,
      totalWagered: 0,
      dailyWithdrawalLimit: formData.dailyWithdrawalLimit,
      withdrawalCountToday: 0,
      isEmailVerified: formData.isEmailVerified,
      isPhoneVerified: formData.isPhoneVerified,
      kycStatus: formData.kycStatus,
      referredBy: null,
      referralEarnings: 0,
      referralCount: 0,
      createdAt: { $date: new Date().toISOString() },
      referralCode: generateReferralCode(),
      lastPasswordChange: { $date: new Date().toISOString() },
      notificationPreferences: formData.notificationPreferences,
      themePreference: formData.themePreference,
      isMoneyTransferPasswordSet: false,
      otp: { verified: false },
      twoFactorEnabled: false,
      passwordHistory: [],
      loginHistory: [],
      deviceTokens: [],
      kycDocuments: [],
      referralUsers: [],
      referralTracking: [],
      betHistory: [],
      profitLossHistory: [],
      depositHistory: [],
      withdrawHistory: [],
      transactionHistory: [],
      bonusActivityLogs: [],
      updatedAt: { $date: new Date().toISOString() },
      __v: 0
    };
    
    // Add to users list
    setUsers([...users, newUser]);
    
    // Reset form
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      avatar: null,
      currency: 'BDT',
      role: 'user',
      status: 'active',
      language: 'bn',
      dailyWithdrawalLimit: 50000,
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: 'unverified',
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      },
      themePreference: 'dark'
    });
    setImagePreview(null);
    
    // You would typically send this data to your backend here
    console.log('New user added:', newUser);
    alert('User created successfully!');
  };

  const toggleStatus = (id) => {
    setUsers(users.map(user => 
      user._id.$oid === id ? { 
        ...user, 
        status: user.status === 'active' ? 'inactive' : 'active' 
      } : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(user => user._id.$oid !== id));
  };

  const formatDate = (dateObj) => {
    if (!dateObj || !dateObj.$date) return 'N/A';
    return new Date(dateObj.$date).toLocaleDateString();
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
            
            {/* Add User Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New User</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <FaUser className="mr-2 text-orange-500" />
                    Basic Information
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                {/* Password Section */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <FaIdCard className="mr-2 text-orange-500" />
                    Security
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                
                {/* Account Settings */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <FaMoneyBill className="mr-2 text-orange-500" />
                    Account Settings
                  </h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="user">User</option>
                    <option value="vip">VIP</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="bn">Bengali</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Withdrawal Limit</label>
                  <input
                    type="number"
                    name="dailyWithdrawalLimit"
                    value={formData.dailyWithdrawalLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter daily withdrawal limit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
                  <select
                    name="kycStatus"
                    value={formData.kycStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="unverified">Unverified</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme Preference</label>
                  <select
                    name="themePreference"
                    value={formData.themePreference}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                {/* Verification Settings */}
                <div className="md:col-span-2 mt-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isEmailVerified"
                        checked={formData.isEmailVerified}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email Verified</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPhoneVerified"
                        checked={formData.isPhoneVerified}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Phone Verified</span>
                    </label>
                  </div>
                </div>
                
                {/* Notification Preferences */}
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Notification Preferences</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notification.email"
                        checked={formData.notificationPreferences.email}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notification.sms"
                        checked={formData.notificationPreferences.sms}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">SMS</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notification.push"
                        checked={formData.notificationPreferences.push}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Push</span>
                    </label>
                  </div>
                </div>
                
                {/* Avatar Upload Section */}
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Profile preview" 
                          className="h-32 w-32 object-cover border border-gray-300 rounded-full"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-0 right-0 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center">
                          <FaRegFileImage className="w-8 h-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-2">Upload profile image</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-end mt-8">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
            
         
          </div>
        </main>
      </div>
    </section>
  );
};

export default Newuser;