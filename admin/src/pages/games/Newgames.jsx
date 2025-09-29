import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaSpinner } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import { toast } from 'react-toastify';

const Newgames = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    gameId: '',
    provider: '',
    category: '',
    portraitImage: null,
    landscapeImage: null,
    featured: false,
    status: true
  });
  const [portraitPreview, setPortraitPreview] = useState(null);
  const [landscapePreview, setLandscapePreview] = useState(null);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Fetch categories and providers on component mount
  useEffect(() => {
    fetchCategories();
    fetchProviders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${base_url}/api/admin/game-categories?status=true`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${base_url}/api/admin/game-providers?status=true`);
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        toast.error('Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error fetching providers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'portrait') {
          setFormData({...formData, portraitImage: file});
          setPortraitPreview(reader.result);
        } else {
          setFormData({...formData, landscapeImage: file});
          setLandscapePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    if (type === 'portrait') {
      setFormData({...formData, portraitImage: null});
      setPortraitPreview(null);
    } else {
      setFormData({...formData, landscapeImage: null});
      setLandscapePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.gameId || !formData.provider || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!formData.portraitImage || !formData.landscapeImage) {
      toast.error('Please upload both portrait and landscape images');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('gameId', formData.gameId);
      submitData.append('provider', formData.provider);
      submitData.append('category', formData.category);
      submitData.append('featured', formData.featured);
      submitData.append('status', formData.status);
      submitData.append('portraitImage', formData.portraitImage);
      submitData.append('landscapeImage', formData.landscapeImage);
      
      const response = await fetch(`${base_url}/api/admin/games`, {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Game added successfully!');
        // Reset form
        setFormData({
          name: '',
          gameId: '',
          provider: '',
          category: '',
          portraitImage: null,
          landscapeImage: null,
          featured: false,
          status: true
        });
        setPortraitPreview(null);
        setLandscapePreview(null);
      } else {
        toast.error(result.error || 'Failed to add game');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Game</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-orange-100">
              <form onSubmit={handleSubmit}>
                {/* Game Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter game name"
                    required
                  />
                </div>
                
                {/* Game ID Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game ID *</label>
                  <input
                    type="text"
                    name="gameId"
                    value={formData.gameId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter unique game ID"
                    required
                  />
                </div>
                
                {/* Game Provider Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game Provider *</label>
                  <select
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    required
                  >
                    <option value="">Select a provider</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider.name}>{provider.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Featured and Status Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                      Featured Game
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="status"
                      name="status"
                      type="checkbox"
                      checked={formData.status}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                    />
                    <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
                      Active Status
                    </label>
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Images *</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Portrait Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Portrait Image</label>
                      <div className="flex items-center justify-center w-full">
                        {portraitPreview ? (
                          <div className="relative w-full">
                            <img 
                              src={portraitPreview} 
                              alt="Portrait preview" 
                              className="h-48 w-full object-contain border border-gray-300 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('portrait')}
                              className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FaRegFileImage className="w-8 md:w-12 h-8 mb-3 md:h-12 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">Click to upload portrait image</p>
                              <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'portrait')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {/* Landscape Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Landscape Image</label>
                      <div className="flex items-center justify-center w-full">
                        {landscapePreview ? (
                          <div className="relative w-full">
                            <img 
                              src={landscapePreview} 
                              alt="Landscape preview" 
                              className="h-48 w-full object-contain border border-gray-300 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('landscape')}
                              className="absolute top-2 right-2 bg-red-500 cursor-pointer text-white p-1 rounded-full"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FaRegFileImage className="w-8 md:w-12 h-8 mb-3 md:h-12 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">Click to upload landscape image</p>
                              <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'landscape')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Adding Game...
                      </>
                    ) : (
                      'Add Game'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Newgames;