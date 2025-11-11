import React, { useState, useEffect } from 'react';
import { FaBell, FaPaperPlane, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaUsers, FaEye, FaChevronLeft, FaChevronRight, FaSignInAlt, FaDesktop, FaMobile, FaTablet, FaExclamationTriangle } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const FailedLoginLogs = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [failedLogins, setFailedLogins] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    username: '',
    ipAddress: '',
    isLocked: 'all',
    startDate: '',
    endDate: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch failed login logs on component mount
  useEffect(() => {
    fetchFailedLogins();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchFailedLogins = async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...filtersObj
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await axios.get(`${base_url}/api/admin/failed-logins`, { params });
      setFailedLogins(response.data.failedLogins);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching failed login logs:', error);
      toast.error('Failed to fetch failed login logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    fetchFailedLogins(1, filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      username: '',
      ipAddress: '',
      isLocked: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    fetchFailedLogins(1, defaultFilters);
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const unlockAccount = async (id) => {
    try {
      await axios.put(`${base_url}/api/admin/failed-logins/${id}/unlock`);
      toast.success('Account unlocked successfully');
      fetchFailedLogins(); // Refresh the list
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast.error('Failed to unlock account');
    }
  };

  const clearFailedLogins = async () => {
    if (!window.confirm('Are you sure you want to clear all failed login attempts?')) {
      return;
    }

    try {
      await axios.delete(`${base_url}/api/admin/failed-logins/clear`);
      toast.success('Failed login attempts cleared successfully');
      fetchFailedLogins(); // Refresh the list
    } catch (error) {
      console.error('Error clearing failed login attempts:', error);
      toast.error('Failed to clear failed login attempts');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Failed Login Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Failed Login Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">Username:</span> {selectedLog.username}</p>
                  <p><span className="font-semibold">Attempt Count:</span> {selectedLog.attemptCount}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Status Information</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Locked:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLog.isLocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedLog.isLocked ? 'Yes' : 'No'}
                    </span>
                  </p>
                  {selectedLog.lockedUntil && (
                    <p><span className="font-semibold">Locked Until:</span> {formatDate(selectedLog.lockedUntil)}</p>
                  )}
                  <p><span className="font-semibold">Last Attempt:</span> {formatDate(selectedLog.lastAttempt)}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Network Information</h4>
              <div className="space-y-2">
                <p><span className="font-semibold">IP Address:</span> {selectedLog.ipAddress}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {selectedLog.isLocked && (
                <button
                  onClick={() => {
                    unlockAccount(selectedLog._id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Unlock Account
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
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
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" /> Failed Login Attempts
              </h2>
              
              <div className="flex space-x-3">
                <button
                  onClick={clearFailedLogins}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg transition-colors flex items-center text-base font-medium"
                >
                  <FaTrash className="mr-2" /> Clear All
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Filter Failed Login Attempts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    placeholder="Search by username..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    value={filters.username}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    name="ipAddress"
                    placeholder="Search by IP..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    value={filters.ipAddress}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <select
                  name="isLocked"
                  value={filters.isLocked}
                  onChange={handleFilterChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                >
                  <option value="all">All Status</option>
                  <option value="true">Locked</option>
                  <option value="false">Not Locked</option>
                </select>
                
                <div className="flex gap-2">
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
              
              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2.5 bg-theme_color text-white rounded-lg transition-colors text-base font-medium w-full"
                  >
                    Filter by Date
                  </button>
                </div>
              </div>
            </div>
            
            {/* Failed Login Logs Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading failed login attempts...</div>
            ) : failedLogins.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg">No failed login attempts found</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Last Attempt</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {failedLogins.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-red-500" />
                            </div>
                            <div className="text-base font-semibold text-gray-900">{log.username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1.5 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            {log.attemptCount} attempts
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base text-gray-900 font-mono">{log.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                            log.isLocked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {log.isLocked ? 'Locked' : 'Not Locked'}
                          </span>
                          {log.lockedUntil && (
                            <div className="text-xs text-gray-500 mt-1">Until: {formatDate(log.lockedUntil)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {formatDate(log.lastAttempt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                          <button
                            className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                            onClick={() => showLogDetails(log)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {log.isLocked && (
                            <button
                              className="p-2 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors"
                              onClick={() => unlockAccount(log._id)}
                              title="Unlock Account"
                            >
                              <FaTimes />
                            </button>
                          )}
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
                  Showing {failedLogins.length} of {pagination.total} failed login attempts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchFailedLogins(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                  >
                    <FaChevronLeft className="mr-1" /> Previous
                  </button>
                  <span className="px-3 py-2 text-base text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchFailedLogins(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                  >
                    Next <FaChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
};

export default FailedLoginLogs;