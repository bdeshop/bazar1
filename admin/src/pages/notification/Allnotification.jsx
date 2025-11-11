import React, { useState, useEffect } from 'react';
import { FaBell, FaPaperPlane, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaUsers, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const Allnotification = () => {
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
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUserSelection}
                  className="px-4 py-2 bg-theme_color text-white rounded-md hover:bg-theme_color/80 transition-colors"
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
                    className="text-theme_color hover:underline text-sm"
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
            {/* Notifications List */}
            <div className=" mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Sent Notifications</h2>
                
                {/* Filters */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full lg:w-64">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color pl-10 text-base"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="sent">Sent</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    >
                      <option value="all">All Types</option>
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                      <option value="promotional">Promotional</option>
                    </select>
                    
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2.5 bg-theme_color text-white rounded-lg transition-colors flex items-center text-base font-medium"
                    >
                      <FaFilter className="mr-2" /> Apply
                    </button>
                    
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base font-medium"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notifications Table */}
              {loading ? (
                <div className="text-center py-12 text-gray-500 text-lg">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">No notifications found</div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Target</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Sent At</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base font-semibold text-gray-900">{notification.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{notification.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                              notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.type === 'success' ? 'bg-green-100 text-green-800' :
                              notification.type === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {notification.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-gray-900 capitalize">{notification.targetType}</div>
                            {notification.targetType === 'specific' && notification.targetUsers && (
                              <div className="text-sm text-gray-500 mt-1">
                                {notification.targetUsers.length} user(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                              notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                              notification.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              notification.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {notification.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-2 text-blue-100 rounded-[5px] cursor-pointer bg-blue-600  transition-colors"
                                onClick={() => previewNotification(notification)}
                                title="Preview"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="p-2 text-red-100 rounded-[5px] bg-red-600 cursor-pointer hover:bg-red-200 transition-colors"
                                onClick={() => deleteNotification(notification._id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                              
                              {notification.status === 'scheduled' && (
                                <button
                                  className="px-3 py-1.5 text-green-100 bg-green-800 rounded-[5px] text-sm font-medium hover:bg-green-200 transition-colors"
                                  onClick={() => updateNotificationStatus(notification._id, 'sent')}
                                >
                                  Send Now
                                </button>
                              )}
                              
                              {notification.status === 'sent' && (
                                <button
                                  className="px-3 py-1.5 text-white bg-orange-500 rounded-[5px] text-sm font-medium cursor-pointer transition-colors"
                                  onClick={() => updateNotificationStatus(notification._id, 'cancelled')}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <div className="text-base text-gray-700 mb-4 sm:mb-0">
                    Showing {notifications.length} of {pagination.total} notifications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchNotifications(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                    >
                      <FaChevronLeft className="mr-1" /> Previous
                    </button>
                    <span className="px-3 py-2 text-base text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchNotifications(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                    >
                      Next <FaChevronRight className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Allnotification;