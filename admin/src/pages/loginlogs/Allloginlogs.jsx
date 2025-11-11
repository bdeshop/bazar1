import React, { useState, useEffect } from 'react';
import { FaBell, FaPaperPlane, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaUsers, FaEye, FaChevronLeft, FaChevronRight, FaSignInAlt, FaDesktop, FaMobile, FaTablet } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const AllLoginLogs = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginLogs, setLoginLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    username: '',
    ipAddress: '',
    startDate: '',
    endDate: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch login logs on component mount
  useEffect(() => {
    fetchLoginLogs();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchLoginLogs = async (page = 1, filtersObj = filters) => {
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

      const response = await axios.get(`${base_url}/api/admin/login-logs`, { params });
      setLoginLogs(response.data.loginLogs);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching login logs:', error);
      toast.error('Failed to fetch login logs');
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
    fetchLoginLogs(1, filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      username: '',
      ipAddress: '',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    fetchLoginLogs(1, defaultFilters);
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop':
        return <FaDesktop className="text-blue-500" />;
      case 'mobile':
        return <FaMobile className="text-green-500" />;
      case 'tablet':
        return <FaTablet className="text-purple-500" />;
      default:
        return <FaDesktop className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Login Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Login Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">Username:</span> {selectedLog.username}</p>
                  {selectedLog.userId && (
                    <p><span className="font-semibold">User ID:</span> {selectedLog.userId.username || selectedLog.userId._id}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Login Status</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLog.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLog.status}
                    </span>
                  </p>
                  {selectedLog.failureReason && (
                    <p><span className="font-semibold">Failure Reason:</span> {selectedLog.failureReason}</p>
                  )}
                  <p><span className="font-semibold">Timestamp:</span> {formatDate(selectedLog.timestamp)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Device Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">Device Type:</span> {selectedLog.deviceType}</p>
                  <p><span className="font-semibold">Browser:</span> {selectedLog.browser || 'Unknown'}</p>
                  <p><span className="font-semibold">Operating System:</span> {selectedLog.os || 'Unknown'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Network Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">IP Address:</span> {selectedLog.ipAddress}</p>
                  {selectedLog.location && (
                    <>
                      <p><span className="font-semibold">Country:</span> {selectedLog.location.country || 'Unknown'}</p>
                      <p><span className="font-semibold">Region:</span> {selectedLog.location.region || 'Unknown'}</p>
                      <p><span className="font-semibold">City:</span> {selectedLog.location.city || 'Unknown'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {selectedLog.userAgent && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">User Agent</h4>
                <p className="text-sm bg-gray-100 p-3 rounded-md overflow-x-auto">
                  {selectedLog.userAgent}
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
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
                <FaSignInAlt className="mr-2 text-theme_color" /> Login Logs
              </h2>
              
              {/* Filters */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
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
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
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
              </div>
            </div>
            
            {/* Date Range Filters */}
            <div className="bg-white p-4 rounded-lg border-[1px] border-gray-200 mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Date Range Filter</h3>
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
            
            {/* Login Logs Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading login logs...</div>
            ) : loginLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg">No login logs found</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-theme_color">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Device</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loginLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-blue-500" />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900">{log.username}</div>
                              {log.userId && log.userId.player_id && (
                                <div className="text-sm text-gray-500">ID: {log.userId.player_id}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2">
                              {getDeviceIcon(log.deviceType)}
                            </div>
                            <div>
                              <div className="text-base text-gray-900 capitalize">{log.deviceType}</div>
                              <div className="text-sm text-gray-500">{log.browser || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base text-gray-900 font-mono">{log.ipAddress}</div>
                          {log.location && log.location.country && (
                            <div className="text-sm text-gray-500">{log.location.country}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                          {log.failureReason && (
                            <div className="text-xs text-gray-500 mt-1">{log.failureReason}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="p-2 text-blue-100 rounded-[5px] bg-blue-600 hover:bg-blue-200 transition-colors"
                            onClick={() => showLogDetails(log)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
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
                  Showing {loginLogs.length} of {pagination.total} login attempts
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchLoginLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                  >
                    <FaChevronLeft className="mr-1" /> Previous
                  </button>
                  <span className="px-3 py-2 text-base text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchLoginLogs(pagination.page + 1)}
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
      <Toaster position="top-right" />
    </section>
  );
};

export default AllLoginLogs;