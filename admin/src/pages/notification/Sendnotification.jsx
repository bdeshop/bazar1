import React, { useState, useEffect } from 'react';
import { FaBell, FaPaperPlane, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaUsers, FaEye } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const Sendnotification = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewNotificationw, setPreviewNotification] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    targetType: 'all',
    search: ''
  });

  // Notification form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    targetType: 'all',
    targetUsers: [],
    userRoles: [],
    scheduledFor: '',
    expiresAt: '',
    status: 'draft',
    actionUrl: '',
    priority: 'medium'
  });

  // Fetch users and notifications on component mount
  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, userSearchTerm]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/notifications/users/list`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchNotifications = async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...filtersObj
      };

      const response = await axios.get(`${base_url}/api/admin/notifications`, { params });
      setNotifications(response.data.notifications);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    const filtered = users.filter(user => 
      user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.player_id?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUserSelection = (user) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRoleChange = (e) => {
    const options = e.target.options;
    const selectedRoles = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedRoles.push(options[i].value);
      }
    }
    setFormData({
      ...formData,
      userRoles: selectedRoles
    });
  };

  const openUserModal = () => {
    setShowUserModal(true);
    setUserSearchTerm('');
  };

  const confirmUserSelection = () => {
    setFormData({
      ...formData,
      targetUsers: selectedUsers.map(user => user._id)
    });
    setShowUserModal(false);
  };

  const sendTestNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${base_url}/api/admin/notifications/test`, {
        title: formData.title,
        message: formData.message,
        type: formData.type
      });
      toast.success('Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    if (formData.targetType === 'specific' && formData.targetUsers.length === 0) {
      toast.error('Please select at least one user for specific notifications');
      return;
    }

    if (formData.targetType === 'role_based' && formData.userRoles.length === 0) {
      toast.error('Please select at least one role for role-based notifications');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${base_url}/api/admin/notifications`, formData);
      
      toast.success('Notification sent successfully!');
      setFormData({
        title: '',
        message: '',
        type: 'info',
        targetType: 'all',
        targetUsers: [],
        userRoles: [],
        scheduledFor: '',
        expiresAt: '',
        status: 'draft',
        actionUrl: '',
        priority: 'medium'
      });
      setSelectedUsers([]);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const previewNotification = (notification) => {
    setPreviewNotification(notification);
    setShowPreviewModal(true);
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await axios.delete(`${base_url}/api/admin/notifications/${id}`);
      toast.success('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const updateNotificationStatus = async (id, status) => {
    try {
      await axios.put(`${base_url}/api/admin/notifications/${id}/status`, { status });
      toast.success('Notification status updated successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
    }
  };

  const applyFilters = () => {
    fetchNotifications(1, filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      type: 'all',
      targetType: 'all',
      search: ''
    };
    setFilters(defaultFilters);
    fetchNotifications(1, defaultFilters);
  };

  return (
    <section className="font-poppins h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      {/* User Selection Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Users</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto mb-4">
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      className={`p-3 border rounded-md cursor-pointer flex items-center justify-between ${
                        selectedUsers.some(u => u._id === user._id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserSelection(user)}
                    >
                      <div>
                        <div className="font-medium">{user.username} ({user.player_id})</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      {selectedUsers.some(u => u._id === user._id) && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <FaTimes className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No users found</div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedUsers.length} user(s) selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 cursor-pointer rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUserSelection}
                  className="px-4 py-2 bg-theme_color cursor-pointer text-white rounded-md hover:bg-theme_color/90 transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewNotification && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preview</h3>
            
            <div className="border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-lg mb-2">{previewNotification.title}</h4>
              <p className="text-gray-700">{previewNotification.message}</p>
              
              {previewNotification.actionUrl && (
                <div className="mt-3">
                  <a 
                    href={previewNotification.actionUrl} 
                    className="text-blue-500 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {previewNotification.actionUrl}
                  </a>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Notification Management</h1>
            
            {/* Send Notification Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Send New Notification</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter notification title"
                      required
                    />
                  </div>
                  
                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter notification message"
                      required
                    ></textarea>
                  </div>
                  
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    >
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                      <option value="promotional">Promotional</option>
                    </select>
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  {/* Target Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      name="targetType"
                      value={formData.targetType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    >
                      <option value="all">All Users</option>
                      <option value="specific">Specific Users</option>
                      {/* <option value="role_based">By User Role</option> */}
                    </select>
                  </div>
                  
                  {/* Action URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action URL (Optional)</label>
                    <input
                      type="url"
                      name="actionUrl"
                      value={formData.actionUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  {/* User Selection (if targetType is specific) */}
                  {formData.targetType === 'specific' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
                      <button
                        type="button"
                        onClick={openUserModal}
                        className="w-full px-4 py-2 border border-gray-300 rounded-[3px] bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span>
                          {selectedUsers.length > 0 
                            ? `${selectedUsers.length} user(s) selected` 
                            : 'Click to select users'
                          }
                        </span>
                        <FaUser className="text-gray-500" />
                      </button>
                    </div>
                  )}
                  
                  {/* Role Selection (if targetType is role_based) */}
                  {formData.targetType === 'role_based' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select User Roles</label>
                      <select
                        multiple
                        value={formData.userRoles}
                        onChange={handleUserRoleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color h-32"
                      >
                        <option value="user">Regular Users</option>
                        <option value="vip">VIP Users</option>
                        <option value="agent">Agents</option>
                        <option value="admin">Admins</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles</p>
                    </div>
                  )}
                  
                  {/* Scheduled For */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For (Optional)</label>
                    <input
                      type="datetime-local"
                      name="scheduledFor"
                      value={formData.scheduledFor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    />
                  </div>
                  
                  {/* Expires At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    />
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
                    disabled={!formData.title || !formData.message}
                  >
                    <FaPaperPlane className="mr-2" /> Send Test
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'draft'})}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-theme_color text-white rounded-md transition-colors flex items-center"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : (
                        <>
                          <FaPaperPlane className="mr-2" /> Send Notification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
  
          </div>
        </main>
      </div>
    </section>
  );
};

export default Sendnotification;