import React, { useState, useEffect } from 'react';
import { FaBell, FaPaperPlane, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaUser, FaUsers, FaEye, FaChevronLeft, FaChevronRight, FaSignInAlt, FaDesktop, FaMobile, FaTablet, FaPlus, FaCheckCircle, FaTimesCircle, FaGlobe } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';

const Ipwhitelist = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'all'
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: '',
    isActive: true
  });

  // Fetch IP whitelist on component mount
  useEffect(() => {
    fetchIpWhitelist();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchIpWhitelist = async (page = 1, filtersObj = filters) => {
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

      const response = await axios.get(`${base_url}/api/admin/ip-whitelist`, { params });
      setIpWhitelist(response.data.ipWhitelist);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching IP whitelist:', error);
      toast.error('Failed to fetch IP whitelist');
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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const applyFilters = () => {
    fetchIpWhitelist(1, filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      isActive: 'all'
    };
    setFilters(defaultFilters);
    fetchIpWhitelist(1, defaultFilters);
  };

  const openAddModal = () => {
    setFormData({
      ipAddress: '',
      description: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      ipAddress: item.ipAddress,
      description: item.description,
      isActive: item.isActive
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const addIpToWhitelist = async () => {
    try {
      await axios.post(`${base_url}/api/admin/ip-whitelist`, formData);
      toast.success('IP address added to whitelist successfully');
      closeModals();
      fetchIpWhitelist();
    } catch (error) {
      console.error('Error adding IP to whitelist:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to add IP to whitelist');
      }
    }
  };

  const updateIpWhitelist = async () => {
    try {
      await axios.put(`${base_url}/api/admin/ip-whitelist/${selectedItem._id}`, formData);
      toast.success('IP whitelist entry updated successfully');
      closeModals();
      fetchIpWhitelist();
    } catch (error) {
      console.error('Error updating IP whitelist:', error);
      toast.error('Failed to update IP whitelist entry');
    }
  };

  const deleteIpFromWhitelist = async (id) => {
    if (!window.confirm('Are you sure you want to remove this IP from the whitelist?')) {
      return;
    }

    try {
      await axios.delete(`${base_url}/api/admin/ip-whitelist/${id}`);
      toast.success('IP address removed from whitelist successfully');
      fetchIpWhitelist();
    } catch (error) {
      console.error('Error removing IP from whitelist:', error);
      toast.error('Failed to remove IP from whitelist');
    }
  };

  const toggleIpStatus = async (item) => {
    try {
      await axios.put(`${base_url}/api/admin/ip-whitelist/${item._id}`, {
        isActive: !item.isActive
      });
      toast.success(`IP address ${!item.isActive ? 'enabled' : 'disabled'} successfully`);
      fetchIpWhitelist();
    } catch (error) {
      console.error('Error toggling IP status:', error);
      toast.error('Failed to update IP status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add IP to Whitelist</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address *</label>
                <input
                  type="text"
                  name="ipAddress"
                  placeholder="e.g., 192.168.1.1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  value={formData.ipAddress}
                  onChange={handleFormChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe why this IP is being whitelisted"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addIpToWhitelist}
                className="px-4 py-2 bg-theme_color text-white rounded-md hover:bg-theme_color_dark transition-colors"
              >
                Add IP
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit IP Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit IP Whitelist</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-base"
                  value={selectedItem.ipAddress}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">IP address cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe why this IP is being whitelisted"
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="editIsActive"
                  className="h-4 w-4 text-theme_color focus:ring-theme_color border-gray-300 rounded"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                />
                <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateIpWhitelist}
                className="px-4 py-2 bg-theme_color text-white rounded-md hover:bg-theme_color_dark transition-colors"
              >
                Update
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
                <FaGlobe className="mr-2 text-theme_color" /> IP Whitelist
              </h2>
              
              <button
                onClick={openAddModal}
                className="px-4 py-2.5 bg-theme_color text-white rounded-lg transition-colors flex items-center text-base font-medium"
              >
                <FaPlus className="mr-2" /> Add IP
              </button>
            </div>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Filter IP Whitelist</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search by IP or description..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg outline-theme_color text-base"
                >
                  <option value="all">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
            
            {/* IP Whitelist Table */}
            {loading ? (
              <div className="text-center py-12 text-gray-500 text-lg">Loading IP whitelist...</div>
            ) : ipWhitelist.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-lg">
                {filters.search || filters.isActive !== 'all' 
                  ? 'No matching IP whitelist entries found' 
                  : 'No IP addresses in whitelist yet'
                }
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-theme_color">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Date Added</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ipWhitelist.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-mono text-gray-900">{item.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-base text-gray-900">{item.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleIpStatus(item)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-1 ${
                              item.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isActive ? (
                              <>
                                <FaCheckCircle /> <span>Active</span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle /> <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <FaUser className="text-blue-500" />
                            </div>
                            <div className="text-base text-gray-900">
                              {item.createdBy?.username || 'System'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                          <button
                            className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                            onClick={() => openEditModal(item)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 bg-red-100 rounded-lg text-red-600 hover:bg-red-200 transition-colors"
                            onClick={() => deleteIpFromWhitelist(item._id)}
                            title="Delete"
                          >
                            <FaTrash />
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
                  Showing {ipWhitelist.length} of {pagination.total} IP whitelist entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchIpWhitelist(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 flex items-center text-base"
                  >
                    <FaChevronLeft className="mr-1" /> Previous
                  </button>
                  <span className="px-3 py-2 text-base text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchIpWhitelist(pagination.page + 1)}
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

export default Ipwhitelist;