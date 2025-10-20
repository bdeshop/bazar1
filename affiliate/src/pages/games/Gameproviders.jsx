import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaEdit, FaTrash, FaGlobe } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Gameproviders = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    providerId: null,
    providerName: ''
  });
  
  // Fetch providers and categories on component mount
  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/admin/game-providers`);
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/game-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, image: file});
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({...formData, image: null});
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingId) {
        // Update existing provider
        await axios.put(`${base_url}/api/admin/game-providers/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Provider updated successfully');
      } else {
        // Create new provider
        await axios.post(`${base_url}/api/admin/game-providers`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Provider added successfully');
      }
      
      // Refresh the providers list
      fetchProviders();
      
      // Reset form
      setFormData({
        name: '',
        website: '',
        category: '',
        image: null
      });
      setImagePreview(null);
      setEditingId(null);
      
    } catch (error) {
      console.error('Error saving provider:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save provider';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editProvider = (provider) => {
    setFormData({
      name: provider.name,
      website: provider.website,
      category: provider.category || '',
      image: null
    });
    setImagePreview(provider.image);
    setEditingId(provider._id);
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      website: '',
      category: '',
      image: null
    });
    setImagePreview(null);
    setEditingId(null);
  };

  const toggleStatus = async (provider) => {
    try {
      const newStatus = !provider.status;
      await axios.put(`${base_url}/api/admin/game-providers/${provider._id}/status`, {
        status: newStatus
      });
      
      // Update local state
      setProviders(providers.map(p => 
        p._id === provider._id ? { ...p, status: newStatus } : p
      ));
      
      toast.success(`Provider ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = (provider) => {
    setDeleteConfirm({
      isOpen: true,
      providerId: provider._id,
      providerName: provider.name
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      isOpen: false,
      providerId: null,
      providerName: ''
    });
  };

  const deleteProvider = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${base_url}/api/admin/game-providers/${deleteConfirm.providerId}`);
      
      // Update local state
      setProviders(providers.filter(provider => provider._id !== deleteConfirm.providerId));
      
      // If editing the deleted provider, cancel edit
      if (editingId === deleteConfirm.providerId) {
        cancelEdit();
      }
      
      toast.success('Provider deleted successfully');
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider');
    } finally {
      setIsLoading(false);
      closeDeleteConfirm();
    }
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the provider "{deleteConfirm.providerName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={deleteProvider}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Game Providers</h1>
            
            {/* Add/Edit Provider Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingId ? 'Edit Provider' : 'Add New Provider'}
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Provider Name Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter provider name"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                {/* Website Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGlobe className="text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="https://example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Category Selection Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(category => category.status) // Only show active categories
                      .map(category => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider Logo</label>
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img 
                          src={imagePreview} 
                          alt="Provider preview" 
                          className="h-48 w-full object-contain border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                          disabled={isLoading}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaRegFileImage className="w-8 md:w-12 h-8 mb-3 md:h-12 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">Click to upload provider logo</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end mt-8 space-x-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (editingId ? 'Update Provider' : 'Add Provider')}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Providers Table */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Providers</h2>
              
              {isLoading && providers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-gray-600">Loading providers...</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No providers found. Add your first provider above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Logo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Website
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {providers.map((provider) => {
                        // Find category name for this provider
                        const category = categories.find(cat => cat._id === provider.category);
                        const categoryName = category ? category.name : 'Uncategorized';
                        
                        return (
                          <tr key={provider._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={`${base_url}/${provider.image}`} 
                                  alt={provider.name} 
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{provider.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a 
                                href={provider.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:text-blue-700 truncate max-w-xs block"
                              >
                                {provider.website}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{categoryName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={provider.status}
                                  onChange={() => toggleStatus(provider)}
                                  disabled={isLoading}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                  {provider.status ? 'Active' : 'Inactive'}
                                </span>
                              </label>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3 hover:bg-blue-700 transition-colors"
                                onClick={() => editProvider(provider)}
                                disabled={isLoading}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px] hover:bg-red-700 transition-colors"
                                onClick={() => confirmDelete(provider)}
                                disabled={isLoading}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Gameproviders;