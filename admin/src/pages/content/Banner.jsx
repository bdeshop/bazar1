import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import { toast, Toaster } from 'react-hot-toast';

const Banner = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  
  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/banners`);
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        console.error('Failed to fetch banners');
        toast.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.images.length > 5) {
      toast.error('Maximum 5 banners allowed at once');
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
              images: [...formData.images, ...newImages]
            });
            setImagePreviews([...imagePreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData({...formData, images: newImages});
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please upload at least one banner image');
      return;
    }
    
    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      
      formData.images.forEach((image) => {
        uploadData.append('images', image);
      });
      
      const response = await fetch(`${base_url}/api/admin/banners`, {
        method: 'POST',
        body: uploadData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Banners created:', result);
        
        // Reset form and refresh banners
        setFormData({ name: '', images: [] });
        setImagePreviews([]);
        fetchBanners();
        toast.success('Banners uploaded successfully!');
      } else {
        toast.error('Failed to upload banners');
      }
    } catch (error) {
      console.error('Error uploading banners:', error);
      toast.error('Error uploading banners');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${base_url}/api/admin/banners/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: !currentStatus })
      });
      
      if (response.ok) {
        fetchBanners(); // Refresh the list
        toast.success('Banner status updated successfully');
      } else {
        toast.error('Failed to update banner status');
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Error updating banner status');
    }
  };

  const confirmDelete = (banner) => {
    setBannerToDelete(banner);
    setShowDeletePopup(true);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setBannerToDelete(null);
  };

  const deleteBanner = async () => {
    if (!bannerToDelete) return;
    
    try {
      const response = await fetch(`${base_url}/api/admin/banners/${bannerToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchBanners(); // Refresh the list
        toast.success('Banner deleted successfully');
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error deleting banner');
    } finally {
      setShowDeletePopup(false);
      setBannerToDelete(null);
    }
  };

  const startEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({ name: banner.name, images: [] });
    setImagePreviews([]);
  };

  const cancelEdit = () => {
    setEditingBanner(null);
    setFormData({ name: '', images: [] });
    setImagePreviews([]);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const editData = new FormData();
      editData.append('name', formData.name);
      
      if (formData.images.length > 0) {
        editData.append('image', formData.images[0]);
      }
      
      const response = await fetch(`${base_url}/api/admin/banners/${editingBanner._id}`, {
        method: 'PUT',
        body: editData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Banner updated:', result);
        
        // Reset form and refresh banners
        setEditingBanner(null);
        setFormData({ name: '', images: [] });
        setImagePreviews([]);
        fetchBanners();
        toast.success('Banner updated successfully!');
      } else {
        toast.error('Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Error updating banner');
    } finally {
      setLoading(false);
    }
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
              Are you sure you want to delete the banner "{bannerToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteBanner}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Banner Management</h1>
            
            {/* Add/Edit Banner Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banners'}
              </h2>
              <form onSubmit={editingBanner ? handleEditSubmit : handleSubmit}>
                {/* Banner Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Name {!editingBanner && '(Optional)'}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter banner name"
                    required={!!editingBanner}
                  />
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingBanner ? 'New Banner Image (Optional)' : 'Banner Images (Max 5)'}
                  </label>
                  
                  {/* Preview of selected images */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Selected {editingBanner ? 'Image' : 'Banners'}:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative border border-gray-300 rounded-md p-2">
                            <img 
                              src={preview} 
                              alt={`Banner preview ${index + 1}`} 
                              className="h-32 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                            <p className="text-xs text-center mt-1 truncate">
                              {formData.images[index]?.name || `Banner ${index + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Current image when editing */}
                  {editingBanner && !imagePreviews.length && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Image:</h3>
                      <div className="relative border border-gray-300 rounded-md p-2 inline-block">
                        <img 
                          src={`${base_url}/${editingBanner.image}`} 
                          alt={editingBanner.name} 
                          className="h-32 w-48 object-cover rounded-md"
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
                          PNG, JPG, GIF up to 10MB {!editingBanner && '(Max 5 images)'}
                        </p>
                        {imagePreviews.length > 0 && (
                          <p className="text-xs text-orange-500 mt-2">
                            {imagePreviews.length} image(s) selected
                          </p>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        multiple={!editingBanner}
                        {...(editingBanner ? {} : { multiple: true })}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end mt-8 space-x-4">
                  {editingBanner && (
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
                    disabled={formData.images.length === 0 && !editingBanner}
                  >
                    {loading ? 'Processing...' : editingBanner ? 'Update Banner' : `Upload ${formData.images.length > 0 ? `(${formData.images.length}) Banners` : 'Banners'}`}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Banners Table */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Banners</h2>
              
              {loading && banners.length === 0 ? (
                <div className="text-center py-8">Loading banners...</div>
              ) : banners.length === 0 ? (
                <div className="text-center py-8">No banners found</div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Preview
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Name
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
                      {banners.map((banner) => (
                        <tr key={banner._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-16 w-24 flex-shrink-0">
                              <img className="h-16 w-24 rounded-md object-cover" src={`${base_url}/${banner.image}`} alt={banner.name} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{banner.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={banner.status}
                                onChange={() => toggleStatus(banner._id, banner.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {banner.status ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3"
                              onClick={() => startEdit(banner)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px]"
                              onClick={() => confirmDelete(banner)}
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

export default Banner;