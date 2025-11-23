import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaLock, FaBell, FaClock, FaListAlt, FaSave, FaUserShield, FaMobile, FaGlobe, FaKey, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const Securitysettings = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: 'email',
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    sessionTimeout: 60,
    maxFailedAttempts: 5,
    accountLockoutTime: 30,
    ipWhitelisting: false,
    deviceWhitelisting: false,
    passwordChangeReminder: true,
    passwordChangeFrequency: 90
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSettings, setUserSettings] = useState(null);

  // Fetch users and security settings on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserSecuritySettings(selectedUserId);
    }
  }, [selectedUserId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/users`);
      setUsers(response.data.users);
      if (response.data.users.length > 0) {
        setSelectedUserId(response.data.users[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSecuritySettings = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/security-settings/${userId}`);
      setUserSettings(response.data);
      setSecuritySettings({
        twoFactorEnabled: response.data.twoFactorEnabled,
        twoFactorMethod: response.data.twoFactorMethod,
        loginAlerts: response.data.loginAlerts,
        suspiciousActivityAlerts: response.data.suspiciousActivityAlerts,
        sessionTimeout: response.data.sessionTimeout,
        maxFailedAttempts: response.data.maxFailedAttempts,
        accountLockoutTime: response.data.accountLockoutTime,
        ipWhitelisting: response.data.ipWhitelisting,
        deviceWhitelisting: response.data.deviceWhitelisting,
        passwordChangeReminder: response.data.passwordChangeReminder,
        passwordChangeFrequency: response.data.passwordChangeFrequency
      });
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast.error('Failed to fetch security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const saveSettings = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      setSaving(true);
      await axios.put(`${base_url}/api/admin/security-settings/${selectedUserId}`, securitySettings);
      toast.success('Security settings saved successfully');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePasswordChangeDate = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await axios.put(`${base_url}/api/admin/security-settings/${selectedUserId}/password-change`);
      toast.success('Password change date updated successfully');
      fetchUserSecuritySettings(selectedUserId);
    } catch (error) {
      console.error('Error updating password change date:', error);
      toast.error('Failed to update password change date');
    }
  };

  const getSelectedUser = () => {
    return users.find(user => user._id === selectedUserId);
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
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaShieldAlt className="mr-2 text-theme_color" /> Security Settings
              </h2>
              
              <div className="flex items-center space-x-3">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  disabled={loading}
                >
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.player_id})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={saveSettings}
                  disabled={saving || !selectedUserId}
                  className="px-4 py-2.5 bg-theme_color text-white rounded-lg transition-colors flex items-center text-base font-medium disabled:opacity-50"
                >
                  <FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            {loading && !userSettings ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading security settings...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Two-Factor Authentication */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaLock className="mr-2 text-blue-500" /> Two-Factor Authentication
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="twoFactorEnabled"
                          checked={securitySettings.twoFactorEnabled}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Enable Two-Factor Authentication</span>
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings.twoFactorEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {securitySettings.twoFactorEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">2FA Method</label>
                        <select
                          name="twoFactorMethod"
                          value={securitySettings.twoFactorMethod}
                          onChange={handleSettingChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                        >
                          <option value="email">Email</option>
                          <option value="authenticator">Authenticator App</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaClock className="mr-2 text-purple-500" /> Session Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        min="1"
                        max="1440"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Failed Attempts
                      </label>
                      <input
                        type="number"
                        name="maxFailedAttempts"
                        min="1"
                        max="10"
                        value={securitySettings.maxFailedAttempts}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Lockout Time (minutes)
                      </label>
                      <input
                        type="number"
                        name="accountLockoutTime"
                        min="1"
                        max="1440"
                        value={securitySettings.accountLockoutTime}
                        onChange={handleSettingChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaBell className="mr-2 text-yellow-500" /> Notification Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="loginAlerts"
                          checked={securitySettings.loginAlerts}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Login Alerts</span>
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings.loginAlerts 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {securitySettings.loginAlerts ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="suspiciousActivityAlerts"
                          checked={securitySettings.suspiciousActivityAlerts}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Suspicious Activity Alerts</span>
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings.suspiciousActivityAlerts 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {securitySettings.suspiciousActivityAlerts ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Access Control */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaUserShield className="mr-2 text-red-500" /> Access Control
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="ipWhitelisting"
                          checked={securitySettings.ipWhitelisting}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">IP Whitelisting</span>
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings.ipWhitelisting 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {securitySettings.ipWhitelisting ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="deviceWhitelisting"
                          checked={securitySettings.deviceWhitelisting}
                          onChange={handleSettingChange}
                          className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">Device Whitelisting</span>
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        securitySettings.deviceWhitelisting 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {securitySettings.deviceWhitelisting ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Policy */}
                <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaKey className="mr-2 text-green-500" /> Password Policy
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="passwordChangeReminder"
                            checked={securitySettings.passwordChangeReminder}
                            onChange={handleSettingChange}
                            className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">Password Change Reminder</span>
                        </label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          securitySettings.passwordChangeReminder 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {securitySettings.passwordChangeReminder ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Change Frequency (days)
                        </label>
                        <input
                          type="number"
                          name="passwordChangeFrequency"
                          min="1"
                          max="365"
                          value={securitySettings.passwordChangeFrequency}
                          onChange={handleSettingChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-start space-y-4">
                      {userSettings && userSettings.lastPasswordChange && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Last Password Change:</span>{' '}
                          {new Date(userSettings.lastPasswordChange).toLocaleDateString()}
                        </div>
                      )}
                      
                      <button
                        onClick={updatePasswordChangeDate}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Update Password Change Date
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </section>
  );
};

export default Securitysettings;