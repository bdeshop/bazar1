// Profile.js
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiChevronRight, FiAlertCircle, FiCopy, FiCheck, FiX, FiEdit, FiEye, FiEyeOff, FiMail, FiPhone, FiCalendar, FiUser, FiShield, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png"
const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal-info");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [personalInfoForm, setPersonalInfoForm] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: ""
  });
  
  const [verificationStatus, setVerificationStatus] = useState({
    email: "not_started",
    phone: "not_started",
    identity: "not_started",
    address: "not_started"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  useEffect(() => {
    if (userData) {
      setPersonalInfoForm({
        fullName: userData.fullName || '',
        dateOfBirth: userData.dateOfBirth || '',
        phone: userData.phone || ''
      });
      
      // Set verification status based on user data
      setVerificationStatus({
        email: userData.isEmailVerified ? "verified" : "not_started",
        phone: userData.isPhoneVerified ? "verified" : "not_started",
        identity: userData.kycStatus || "not_started",
        address: "not_started"
      });
    }
  }, [userData]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data
      const response = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        throw new Error('Failed to fetch user data');
      }
      
      // Fetch verification status
      const verificationResponse = await axios.get(`${API_BASE_URL}/api/user/verification-status`);
      if (verificationResponse.data.success) {
        setVerificationStatus(verificationResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', "New passwords don't match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', "New password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        showMessage('success', "Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        showMessage('error', response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.response?.data?.message || "Failed to change password");
    }
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const response = await axios.put(`${API_BASE_URL}/api/user/update-personal-info`, personalInfoForm);
      
      if (response.data.success) {
        showMessage('success', "Personal information updated successfully!");
        setUserData(prev => ({ ...prev, ...personalInfoForm }));
        setIsEditing(false);
      } else {
        showMessage('error', response.data.message || "Failed to update information");
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      showMessage('error', error.response?.data?.message || "Failed to update information");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerificationRequest = async (type) => {
    try {
      let response;
      
      if (type === "email") {
        response = await axios.post(`${API_BASE_URL}/api/user/request-email-verification`);
        if (response.data.success) {
          showMessage('success', "Verification email sent. Please check your inbox.");
          setVerificationStatus(prev => ({ ...prev, email: "pending" }));
        }
      } else if (type === "phone") {
        response = await axios.post(`${API_BASE_URL}/api/user/request-phone-verification`);
        if (response.data.success) {
          showMessage('success', "Verification SMS sent. Please check your phone.");
          setVerificationStatus(prev => ({ ...prev, phone: "pending" }));
        }
      } else {
        // For identity and address verification, show a prompt for manual verification
        const otp = prompt(`Enter verification code for ${type}:`);
        if (otp) {
          if (type === "email") {
            response = await axios.post(`${API_BASE_URL}/api/user/verify-email`, { otp });
          } else if (type === "phone") {
            response = await axios.post(`${API_BASE_URL}/api/user/verify-phone`, { otp });
          }
          
          if (response && response.data.success) {
            showMessage('success', `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
            setVerificationStatus(prev => ({ ...prev, [type]: "verified" }));
            // Refresh user data to get updated verification status
            checkAuthAndFetchData();
          }
        }
      }
    } catch (error) {
      console.error(`Error with ${type} verification:`, error);
      showMessage('error', error.response?.data?.message || `Failed to verify ${type}`);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const isCurrentlyEnabled = userData.twoFactorEnabled || false;
      const response = await axios.post(`${API_BASE_URL}/api/user/toggle-2fa`, {
        enable: !isCurrentlyEnabled
      });
      
      if (response.data.success) {
        showMessage('success', response.data.message);
        setUserData(prev => ({ ...prev, twoFactorEnabled: !isCurrentlyEnabled }));
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      showMessage('error', error.response?.data?.message || "Failed to update 2FA settings");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { color: "bg-green-500", text: "Verified", icon: <FiCheck className="inline mr-1" /> },
      pending: { color: "bg-yellow-500", text: "Pending", icon: <FiAlertCircle className="inline mr-1" /> },
      not_started: { color: "bg-gray-500", text: "Not Started", icon: <FiX className="inline mr-1" /> },
      rejected: { color: "bg-red-500", text: "Rejected", icon: <FiX className="inline mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig.not_started;
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${config.color} text-white flex items-center`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="w-full flex items-center justify-center">
           <div className='w-full p-[20px] flex justify-center items-center'>
                          <div className="relative w-24 h-24 flex justify-center items-center">
                            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                            <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                            </div>
                          </div>
                        </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Message Notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Profile Content */}
           <div className={`flex-1 overflow-auto transition-all duration-300`}>
          <div className="mx-auto w-full min-h-screen max-w-screen-xl md:px-[50px] px-[10px] pt-[60px] py-4"> 
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
              {/* Left Navigation */}
              <div className="w-full lg:w-64 bg-[#161616] h-auto rounded-[5px] border border-gray-800">
                <h2 className="text-lg font-semibold px-4 py-3 border-b border-gray-800">Profile</h2>
                <div className="flex flex-col">
                  <button 
                    onClick={() => setActiveTab("personal-info")}
                    className={`px-4 py-3 text-left cursor-pointer transition-colors ${
                      activeTab === "personal-info" 
                        ? "bg-[#1f1f1f] font-medium text-white" 
                        : "text-gray-300 hover:bg-[#1f1f1f]"
                    }`}
                  >
                    Personal info
                  </button>
                  <button 
                    onClick={() => setActiveTab("login-security")}
                    className={`px-4 py-3 text-left cursor-pointer transition-colors ${
                      activeTab === "login-security" 
                        ? "bg-[#1f1f1f] font-medium text-white" 
                        : "text-gray-300 hover:bg-[#1f1f1f]"
                    }`}
                  >
                    Login & Security
                  </button>
                  <button 
                    onClick={() => setActiveTab("verification")}
                    className={`px-4 py-3 text-left cursor-pointer transition-colors ${
                      activeTab === "verification" 
                        ? "bg-[#1f1f1f] font-medium text-white" 
                        : "text-gray-300 hover:bg-[#1f1f1f]"
                    }`}
                  >
                    Verification
                  </button>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 bg-[#161616] border border-gray-800 rounded-md p-6">
                
                {/* Personal Info Tab */}
                {activeTab === "personal-info" && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Personal info</h2>
                      {!isEditing ? (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="bg-theme_color text-white px-4 py-2 cursor-pointer text-sm hover:bg-theme_color/80 flex items-center"
                        >
                          <FiEdit className="mr-1" /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={handlePersonalInfoSubmit}
                            disabled={isUpdating}
                            className="bg-theme_color text-white px-4 py-2 cursor-pointer text-sm disabled:opacity-50 flex items-center"
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            onClick={() => {
                              setIsEditing(false);
                              setPersonalInfoForm({
                                fullName: userData.fullName || '',
                                dateOfBirth: userData.dateOfBirth || '',
                                phone: userData.phone || ''
                              });
                            }}
                            className="bg-gray-600 text-white px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 flex items-center"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="text-white flex items-center gap-2">
                          {userData?.username || 'N/A'} 
                          <FiCopy 
                            className="text-gray-400 cursor-pointer hover:text-white" 
                            onClick={() => copyToClipboard(userData?.username)}
                          />
                        </p>
                      </div>
                    </div>

                    {/* Player ID */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-800">
                      <div>
                        <p className="text-sm text-gray-400">Player ID</p>
                        <p className="text-white flex items-center gap-2">
                          {userData?.player_id || 'N/A'}
                          <FiCopy 
                            className="text-gray-400 cursor-pointer hover:text-white" 
                            onClick={() => copyToClipboard(userData?.player_id)}
                          />
                        </p>
                      </div>
                    </div>

                    {/* Full legal name */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Full legal name</p>
                        {isEditing ? (
                          <input
                            type="text"
                            name="fullName"
                            value={personalInfoForm.fullName}
                            onChange={handlePersonalInfoChange}
                            className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-theme_color"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-white">{userData?.fullName || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Date of birth</p>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={personalInfoForm.dateOfBirth}
                            onChange={handlePersonalInfoChange}
                            className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-theme_color"
                          />
                        ) : (
                          <p className="text-white">{userData?.dateOfBirth || 'Not set'}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400">Phone</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={personalInfoForm.phone}
                            onChange={handlePersonalInfoChange}
                            className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-theme_color"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <p className="text-white flex items-center gap-2">
                            {userData?.phone || 'Not set'}
                            {!userData?.isPhoneVerified && <FiAlertCircle className="text-orange-400" />}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{userData?.email || 'Not set'}</p>
                      </div>
                      <div className="flex items-center text-theme_color cursor-pointer hover:text-theme_color/80">
                        <span className="mr-1">Manage</span>
                        <FiChevronRight />
                      </div>
                    </div>
                  </>
                )}

                {/* Login & Security Tab */}
                {activeTab === "login-security" && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Login & Security</h2>

                    {/* Password Change */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              className="w-full bg-[#222] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-theme_color"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-sm text-gray-400 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full bg-[#222] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-theme_color"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full bg-[#222] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-theme_color"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="bg-theme_color text-white px-6 py-3 rounded hover:bg-theme_color/80 transition-colors"
                        >
                          Change Password
                        </button>
                      </form>
                    </div>

                    {/* Security Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security Settings</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-800">
                          <div className="flex items-center gap-3">
                            <FiMail className="text-gray-400" />
                            <div>
                              <p className="text-white">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-400">Add an extra layer of security</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleToggle2FA}
                            className={`px-4 py-2 rounded text-sm ${
                              userData.twoFactorEnabled 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : 'bg-theme_color text-white hover:bg-theme_color/80'
                            }`}
                          >
                            {userData.twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-800">
                          <div className="flex items-center gap-3">
                            <FiShield className="text-gray-400" />
                            <div>
                              <p className="text-white">Login Alerts</p>
                              <p className="text-sm text-gray-400">Get notified of new logins</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Enabled</span>
                            <div className="w-12 h-6 bg-theme_color rounded-full relative">
                              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-3">
                          <div className="flex items-center gap-3">
                            <FiLock className="text-gray-400" />
                            <div>
                              <p className="text-white">Active Sessions</p>
                              <p className="text-sm text-gray-400">Manage your active logins</p>
                            </div>
                          </div>
                          <button className="text-theme_color hover:text-theme_color/80">
                            View All
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Verification Tab */}
                {activeTab === "verification" && (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Verification</h2>
                    <p className="text-gray-400 mb-6">
                      Complete your verification to access all features and increase your limits.
                    </p>

                    <div className="space-y-4">
                      {/* Email Verification */}
                      <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <FiMail className="text-gray-400 text-lg" />
                            <span className="text-white">Email Verification</span>
                          </div>
                          {getStatusBadge(verificationStatus.email)}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Verify your email address to receive important notifications and updates.
                        </p>
                        {verificationStatus.email === "not_started" && (
                          <button 
                            onClick={() => handleVerificationRequest("email")}
                            className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                          >
                            Verify Email
                          </button>
                        )}
                        {verificationStatus.email === "pending" && (
                          <div>
                            <p className="text-yellow-400 text-sm mb-2">Verification email sent. Please check your inbox.</p>
                            <button 
                              onClick={() => handleVerificationRequest("email")}
                              className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                            >
                              Resend Code
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Phone Verification */}
                      <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <FiPhone className="text-gray-400 text-lg" />
                            <span className="text-white">Phone Verification</span>
                          </div>
                          {getStatusBadge(verificationStatus.phone)}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Verify your phone number for additional security and faster withdrawals.
                        </p>
                        {verificationStatus.phone === "not_started" && (
                          <button 
                            onClick={() => handleVerificationRequest("phone")}
                            className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                          >
                            Verify Phone
                          </button>
                        )}
                        {verificationStatus.phone === "pending" && (
                          <div>
                            <p className="text-yellow-400 text-sm mb-2">Verification SMS sent. Please check your phone.</p>
                            <button 
                              onClick={() => handleVerificationRequest("phone")}
                              className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                            >
                              Resend Code
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Identity Verification */}
                      <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <FiUser className="text-gray-400 text-lg" />
                            <span className="text-white">Identity Verification</span>
                          </div>
                          {getStatusBadge(verificationStatus.identity)}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Upload a government-issued ID to verify your identity.
                        </p>
                        {verificationStatus.identity === "not_started" && (
                          <button 
                            onClick={() => handleVerificationRequest("identity")}
                            className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                          >
                            Start Verification
                          </button>
                        )}
                      </div>

                      {/* Address Verification */}
                      <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <FiCalendar className="text-gray-400 text-lg" />
                            <span className="text-white">Address Verification</span>
                          </div>
                          {getStatusBadge(verificationStatus.address)}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          Verify your address with a recent utility bill or bank statement.
                        </p>
                        {verificationStatus.address === "not_started" && (
                          <button 
                            onClick={() => handleVerificationRequest("address")}
                            className="bg-theme_color text-white px-4 py-2 rounded text-sm hover:bg-theme_color/80"
                          >
                            Verify Address
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Profile;