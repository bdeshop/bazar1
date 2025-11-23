import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';

const Sociallink = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    displayName: '',
    backgroundColor: '#1877F2',
    order: 0,
    isActive: true,
    opensInNewTab: true
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  
  // Platform options with default colors
  const platformOptions = [
    { value: 'facebook', label: 'Facebook', color: '#1877F2' },
    { value: 'instagram', label: 'Instagram', color: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)' },
    { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
    { value: 'youtube', label: 'YouTube', color: '#FF0000' },
    { value: 'pinterest', label: 'Pinterest', color: '#E60023' },
    { value: 'tiktok', label: 'TikTok', color: '#000000' },
    { value: 'telegram', label: 'Telegram', color: '#0088CC' },
    { value: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
    { value: 'discord', label: 'Discord', color: '#5865F2' },
    { value: 'reddit', label: 'Reddit', color: '#FF4500' },
    { value: 'medium', label: 'Medium', color: '#000000' },
    { value: 'github', label: 'GitHub', color: '#181717' },
    { value: 'snapchat', label: 'Snapchat', color: '#FFFC00' },
    { value: 'viber', label: 'Viber', color: '#7360F2' },
    { value: 'wechat', label: 'WeChat', color: '#07C160' },
    { value: 'line', label: 'Line', color: '#00C300' },
    { value: 'skype', label: 'Skype', color: '#00AFF0' }
  ];

  // Fetch social links on component mount
  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/social-links`);
      if (response.ok) {
        const data = await response.json();
        setSocialLinks(data.data || []);
      } else {
        console.error('Failed to fetch social links');
        toast.error('Failed to fetch social links');
      }
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast.error('Error fetching social links');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill display name and background color when platform is selected
    if (name === 'platform' && value) {
      const selectedPlatform = platformOptions.find(opt => opt.value === value);
      if (selectedPlatform) {
        setFormData(prev => ({
          ...prev,
          platform: value,
          displayName: selectedPlatform.label,
          backgroundColor: selectedPlatform.color
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.url || !formData.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/social-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Social link created:', result);
        
        // Reset form and refresh links
        resetForm();
        fetchSocialLinks();
        toast.success('Social link created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create social link');
      }
    } catch (error) {
      console.error('Error creating social link:', error);
      toast.error('Error creating social link');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      displayName: '',
      backgroundColor: '#1877F2',
      order: 0,
      isActive: true,
      opensInNewTab: true
    });
    setEditingLink(null);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${base_url}/api/admin/social-links/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (response.ok) {
        fetchSocialLinks(); // Refresh the list
        toast.success('Social link status updated successfully');
      } else {
        toast.error('Failed to update social link status');
      }
    } catch (error) {
      console.error('Error updating social link status:', error);
      toast.error('Error updating social link status');
    }
  };

  const confirmDelete = (link) => {
    setLinkToDelete(link);
    setShowDeletePopup(true);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setLinkToDelete(null);
  };

  const deleteLink = async () => {
    if (!linkToDelete) return;
    
    try {
      const response = await fetch(`${base_url}/api/admin/social-links/${linkToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchSocialLinks(); // Refresh the list
        toast.success('Social link deleted successfully');
      } else {
        toast.error('Failed to delete social link');
      }
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast.error('Error deleting social link');
    } finally {
      setShowDeletePopup(false);
      setLinkToDelete(null);
    }
  };

  const startEdit = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      displayName: link.displayName,
      backgroundColor: link.backgroundColor,
      order: link.order,
      isActive: link.isActive,
      opensInNewTab: link.opensInNewTab
    });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.url || !formData.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/social-links/${editingLink._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Social link updated:', result);
        
        // Reset form and refresh links
        resetForm();
        fetchSocialLinks();
        toast.success('Social link updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update social link');
      }
    } catch (error) {
      console.error('Error updating social link:', error);
      toast.error('Error updating social link');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/social-links/initialize-defaults`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchSocialLinks();
        toast.success('Default social links initialized successfully!');
      } else {
        toast.error('Failed to initialize default social links');
      }
    } catch (error) {
      console.error('Error initializing default social links:', error);
      toast.error('Error initializing default social links');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      youtube: '📺',
      pinterest: '📌',
      tiktok: '🎵',
      telegram: '📨',
      whatsapp: '💬',
      linkedin: '💼',
      discord: '🎮',
      reddit: '🔴',
      medium: '📝',
      github: '💻',
      snapchat: '👻',
      viber: '💜',
      wechat: '💚',
      line: '💚',
      skype: '💙'
    };
    return icons[platform] || '🔗';
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the social link "{linkToDelete?.displayName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Social Links Management</h1>
              {socialLinks.length === 0 && (
                <button
                  onClick={initializeDefaults}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Initialize Defaults
                </button>
              )}
            </div>
            
            {/* Add/Edit Social Link Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingLink ? 'Edit Social Link' : 'Add New Social Link'}
              </h2>
              <form onSubmit={editingLink ? handleEditSubmit : handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      required
                    >
                      <option value="">Select Platform</option>
                      {platformOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter display name"
                      required
                    />
                  </div>

                  {/* URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="https://example.com/your-profile"
                      required
                    />
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="backgroundColor"
                        value={formData.backgroundColor.includes('gradient') ? '#1877F2' : formData.backgroundColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                        placeholder="#1877F2 or gradient"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use hex color or CSS gradient
                    </p>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      min="0"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2">
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="opensInNewTab"
                          checked={formData.opensInNewTab}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Open in new tab</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                {formData.platform && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Preview:</h3>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ 
                          background: formData.backgroundColor,
                          backgroundImage: formData.backgroundColor.includes('gradient') ? formData.backgroundColor : 'none'
                        }}
                      >
                        <span className="text-lg">{getPlatformIcon(formData.platform)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{formData.displayName}</p>
                        <p className="text-sm text-gray-600 truncate max-w-xs">{formData.url}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end mt-8 space-x-4">
                  {editingLink && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : editingLink ? 'Update Link' : 'Add Social Link'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Social Links Table */}
            <div className="bg-white rounded-[5px] border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">All Social Links</h2>
              </div>
              
              {loading && socialLinks.length === 0 ? (
                <div className="text-center py-8">Loading social links...</div>
              ) : socialLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No social links found</p>
                  <button
                    onClick={initializeDefaults}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Initialize Default Social Links
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Platform
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Display Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          URL
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Order
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
                      {socialLinks.map((link) => (
                        <tr key={link._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
                                style={{ 
                                  background: link.backgroundColor,
                                  backgroundImage: link.backgroundColor.includes('gradient') ? link.backgroundColor : 'none'
                                }}
                              >
                                <span className="text-sm">{getPlatformIcon(link.platform)}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {link.platform}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{link.displayName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {link.url}
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{link.order}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={link.isActive}
                                onChange={() => toggleStatus(link._id, link.isActive)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {link.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3 hover:bg-blue-700"
                              onClick={() => startEdit(link)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px] hover:bg-red-700"
                              onClick={() => confirmDelete(link)}
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
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Sociallink;