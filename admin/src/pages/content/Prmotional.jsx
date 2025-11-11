import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaLink } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import { toast, Toaster } from 'react-hot-toast';

const Promotional = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    startDate: '',
    endDate: '',
    status: true,
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  
  // Fetch promotions on component mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/promotionals`);
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      } else {
        console.error('Failed to fetch promotions');
        toast.error('Failed to fetch promotions');
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Error fetching promotions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 1) {
      toast.error('Only one image allowed for promotional content');
      return;
    }
    
    const newPreviews = [];
    const newImages = [];
    
    files.forEach(file => {
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          newImages.push(file);
          
          // When all files are processed
          if (newPreviews.length === files.length) {
            setFormData({
              ...formData,
              images: [...newImages]
            });
            setImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = () => {
    setFormData({...formData, images: []});
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please upload a promotional image');
      return;
    }
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('targetUrl', formData.targetUrl);
      uploadData.append('startDate', formData.startDate);
      uploadData.append('endDate', formData.endDate);
      uploadData.append('status', formData.status);
      uploadData.append('image', formData.images[0]);
      
      const response = await fetch(`${base_url}/api/admin/promotionals`, {
        method: 'POST',
        body: uploadData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Promotion created:', result);
        
        // Reset form and refresh promotions
        setFormData({
          title: '',
          description: '',
          targetUrl: '',
          startDate: '',
          endDate: '',
          status: true,
          images: []
        });
        setImagePreviews([]);
        fetchPromotions();
        toast.success('Promotion created successfully!');
      } else {
        toast.error('Failed to create promotion');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast.error('Error creating promotion');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${base_url}/api/admin/promotionals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: !currentStatus })
      });
      
      if (response.ok) {
        fetchPromotions(); // Refresh the list
        toast.success('Promotion status updated successfully');
      } else {
        toast.error('Failed to update promotion status');
      }
    } catch (error) {
      console.error('Error updating promotion status:', error);
      toast.error('Error updating promotion status');
    }
  };

  const confirmDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setShowDeletePopup(true);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setPromotionToDelete(null);
  };

  const deletePromotion = async () => {
    if (!promotionToDelete) return;
    
    try {
      const response = await fetch(`${base_url}/api/admin/promotionals/${promotionToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPromotions(); // Refresh the list
        toast.success('Promotion deleted successfully');
      } else {
        toast.error('Failed to delete promotion');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error deleting promotion');
    } finally {
      setShowDeletePopup(false);
      setPromotionToDelete(null);
    }
  };

  const startEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      targetUrl: promotion.targetUrl,
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      status: promotion.status,
      images: []
    });
    setImagePreviews([]);
  };

  const cancelEdit = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      targetUrl: '',
      startDate: '',
      endDate: '',
      status: true,
      images: []
    });
    setImagePreviews([]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const editData = new FormData();
      editData.append('title', formData.title);
      editData.append('description', formData.description);
      editData.append('targetUrl', formData.targetUrl);
      editData.append('startDate', formData.startDate);
      editData.append('endDate', formData.endDate);
      editData.append('status', formData.status);
      
      if (formData.images.length > 0) {
        editData.append('image', formData.images[0]);
      }
      
      const response = await fetch(`${base_url}/api/admin/promotionals/${editingPromotion._id}`, {
        method: 'PUT',
        body: editData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Promotion updated:', result);
        
        // Reset form and refresh promotions
        setEditingPromotion(null);
        setFormData({
          title: '',
          description: '',
          targetUrl: '',
          startDate: '',
          endDate: '',
          status: true,
          images: []
        });
        setImagePreviews([]);
        fetchPromotions();
        toast.success('Promotion updated successfully!');
      } else {
        toast.error('Failed to update promotion');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast.error('Error updating promotion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-50 flex items-center justify-center z-[1000000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the promotion "{promotionToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deletePromotion}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Promotional Content Management</h1>
            
            {/* Add/Edit Promotion Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </h2>
              <form onSubmit={editingPromotion ? handleEditSubmit : handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      placeholder="Enter promotion title"
                      required
                    />
                  </div>
                  
                  {/* Target URL Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLink className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="targetUrl"
                        value={formData.targetUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                        placeholder="/promotion-path"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter promotion description"
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Start Date Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      />
                    </div>
                  </div>
                  
                  {/* End Date Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Status Field */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Promotion</span>
                  </label>
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingPromotion ? 'New Promotional Image (Optional)' : 'Promotional Image *'}
                  </label>
                  
                  {/* Preview of selected image */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Image:</h3>
                      <div className="relative w-full max-w-md">
                        <img 
                          src={imagePreviews[0]} 
                          alt="Promotional preview" 
                          className="h-48 w-full object-contain border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Current image when editing */}
                  {editingPromotion && !imagePreviews.length && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Image:</h3>
                      <div className="relative w-full max-w-md">
                        <img 
                          src={`${base_url}/${editingPromotion.image}`} 
                          alt={editingPromotion.title} 
                          className="h-48 w-full object-contain border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Upload area */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaRegFileImage className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end mt-8 space-x-4">
                  {editingPromotion && (
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
                    disabled={formData.images.length === 0 && !editingPromotion}
                  >
                    {loading ? 'Processing...' : editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Promotions Table */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Promotions</h2>
              
              {loading && promotions.length === 0 ? (
                <div className="text-center py-8">Loading promotions...</div>
              ) : promotions.length === 0 ? (
                <div className="text-center py-8">No promotions found</div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Preview
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Period
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
                      {promotions.map((promotion) => (
                        <tr key={promotion._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-16 w-24 flex-shrink-0">
                              <img className="h-16 w-24 rounded-md object-cover" src={`${base_url}/${promotion.image}`} alt={promotion.title} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{promotion.title}</div>
                            <div className="text-xs text-gray-500">{promotion.targetUrl}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{promotion.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(promotion.startDate)}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {formatDate(promotion.endDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={promotion.status}
                                onChange={() => toggleStatus(promotion._id, promotion.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {promotion.status ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3"
                              onClick={() => startEdit(promotion)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px]"
                              onClick={() => confirmDelete(promotion)}
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

export default Promotional;