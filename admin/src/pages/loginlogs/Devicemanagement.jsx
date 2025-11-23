import React, { useState, useEffect } from 'react';
import { FaLaptop, FaMobile, FaTablet, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaEye, FaChevronLeft, FaChevronRight, FaCheck, FaTimesCircle, FaGlobe } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const Devicemanagement = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    deviceType: 'all',
    isTrusted: 'all',
    username: '',
    search: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchDevices = async (page = 1, filtersObj = filters) => {
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

      const response = await axios.get(`${base_url}/api/admin/devices`, { params });
      setDevices(response.data.devices);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to fetch devices');
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
    fetchDevices(1, filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      deviceType: 'all',
      isTrusted: 'all',
      username: '',
      search: ''
    };
    setFilters(defaultFilters);
    fetchDevices(1, defaultFilters);
  };

  const showDeviceDetails = (device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const toggleDeviceTrust = async (deviceId, isTrusted) => {
    try {
      setLoading(true);
      await axios.put(`${base_url}/api/admin/devices/${deviceId}/trust`, { isTrusted });
      toast.success(`Device ${isTrusted ? 'trusted' : 'untrusted'} successfully`);
      fetchDevices();
    } catch (error) {
      console.error('Error updating device trust:', error);
      toast.error('Failed to update device trust');
    } finally {
      setLoading(false);
    }
  };

  const deleteDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${base_url}/api/admin/devices/${deviceId}`);
      toast.success('Device deleted successfully');
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop':
        return <FaLaptop className="text-blue-500 text-lg" />;
      case 'mobile':
        return <FaMobile className="text-green-500 text-lg" />;
      case 'tablet':
        return <FaTablet className="text-purple-500 text-lg" />;
      default:
        return <FaLaptop className="text-gray-500 text-lg" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationString = (location) => {
    if (!location) return 'Unknown';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Device Details Modal */}
      {showDetailsModal && selectedDevice && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Device Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">Username:</span> {selectedDevice.userId?.username || 'Unknown'}</p>
                  <p><span className="font-semibold">Player ID:</span> {selectedDevice.userId?.player_id || 'Unknown'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Device Status</h4>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Trusted:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDevice.isTrusted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDevice.isTrusted ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p><span className="font-semibold">Last Used:</span> {formatDate(selectedDevice.lastUsed)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Device Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">Device Name:</span> {selectedDevice.deviceName}</p>
                  <p><span className="font-semibold">Device Type:</span> {selectedDevice.deviceType}</p>
                  <p><span className="font-semibold">Browser:</span> {selectedDevice.browser || 'Unknown'}</p>
                  <p><span className="font-semibold">Operating System:</span> {selectedDevice.os || 'Unknown'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Network Information</h4>
                <div className="space-y-2">
                  <p><span className="font-semibold">IP Address:</span> {selectedDevice.ipAddress}</p>
                  <p>
                    <span className="font-semibold">Location:</span> 
                    <span className="flex items-center mt-1">
                      <FaGlobe className="text-gray-500 mr-1" />
                      {getLocationString(selectedDevice.location)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {selectedDevice.userAgent && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">User Agent</h4>
                <p className="text-sm bg-gray-100 p-3 rounded-md overflow-x-auto">
                  {selectedDevice.userAgent}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => toggleDeviceTrust(selectedDevice._id, !selectedDevice.isTrusted)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedDevice.isTrusted
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {selectedDevice.isTrusted ? 'Mark as Untrusted' : 'Mark as Trusted'}
              </button>
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
                <FaLaptop className="mr-2 text-theme_color" /> Device Management
              </h2>
              
              {/* Filters */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search devices..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>
                  
                  <select
                    name="deviceType"
                    value={filters.deviceType}
                    onChange={handleFilterChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  >
                    <option value="all">All Device Types</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <select
                    name="isTrusted"
                    value={filters.isTrusted}
                    onChange={handleFilterChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  >
                    <option value="all">All Trust Status</option>
                    <option value="true">Trusted</option>
                    <option value="false">Untrusted</option>
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
            
            {/* Devices Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading devices...</div>
            ) : devices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg">No devices found</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-theme_color">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Device</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Trust Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Last Used</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device) => (
                      <tr key={device._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-blue-500" />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-gray-900">{device.userId?.username || 'Unknown'}</div>
                              {device.userId?.player_id && (
                                <div className="text-sm text-gray-500">ID: {device.userId.player_id}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2">
                              {getDeviceIcon(device.deviceType)}
                            </div>
                            <div>
                              <div className="text-base text-gray-900">{device.deviceName}</div>
                              <div className="text-sm text-gray-500 capitalize">{device.deviceType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base text-gray-900 font-mono">{device.ipAddress}</div>
                          {device.location && (
                            <div className="text-sm text-gray-500">{getLocationString(device.location)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center w-fit ${
                            device.isTrusted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {device.isTrusted ? (
                              <><FaCheck className="mr-1" /> Trusted</>
                            ) : (
                              <><FaTimesCircle className="mr-1" /> Untrusted</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {formatDate(device.lastUsed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                              onClick={() => showDeviceDetails(device)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="p-2 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors"
                              onClick={() => deleteDevice(device._id)}
                              title="Delete Device"
                            >
                              <FaTrash />
                            </button>
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                device.isTrusted
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              onClick={() => toggleDeviceTrust(device._id, !device.isTrusted)}
                              title={device.isTrusted ? 'Mark as Untrusted' : 'Mark as Trusted'}
                            >
                              {device.isTrusted ? <FaTimes /> : <FaCheck />}
                            </button>
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
                  Showing {devices.length} of {pagination.total} devices
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchDevices(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                  >
                    <FaChevronLeft className="mr-1" /> Previous
                  </button>
                  <span className="px-3 py-2 text-base text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchDevices(pagination.page + 1)}
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

export default Devicemanagement;