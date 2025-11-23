import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTrash, FaSpinner, FaEye, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const Logoupload = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBranding, setCurrentBranding] = useState({
    logo: null,
    favicon: null,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    type: null, // 'logo' or 'favicon'
    title: '',
    message: ''
  });
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Axios instance with base configuration
  const api = axios.create({
    baseURL: `${base_url}/api/admin`,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Add request interceptor to include auth token if needed
  api.interceptors.request.use(
    (config) => {
      // You can add authentication tokens here if needed
      // const token = localStorage.getItem('authToken');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      setError(error.response?.data?.error || 'An error occurred');
      setUploading(false);
      return Promise.reject(error);
    }
  );
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch current branding on component mount
  useEffect(() => {
    fetchCurrentBranding();
  }, []);

  const fetchCurrentBranding = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branding');
      setCurrentBranding(response.data);
    } catch (error) {
      console.error('Error fetching branding:', error);
      setError('Failed to fetch current branding');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file for logo');
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file size must be less than 5MB');
      return;
    }
    
    setLogoFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file for favicon');
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Favicon file size must be less than 5MB');
      return;
    }
    
    setFaviconFile(file);
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview(null);
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!logoFile && !faviconFile) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }

      const response = await api.post('/upload-branding', formData);
      
      setSuccess('Files uploaded successfully');
      
      // Reset form after successful upload
      removeLogo();
      removeFavicon();
      
      // Refresh current branding
      await fetchCurrentBranding();
      
    } catch (error) {
      console.error('Error uploading files:', error);
      // Error is handled by interceptor
    } finally {
      setUploading(false);
    }
  };

  const openDeletePopup = (type) => {
    setDeletePopup({
      isOpen: true,
      type,
      title: `Delete ${type === 'logo' ? 'Logo' : 'Favicon'}`,
      message: `Are you sure you want to delete the ${type === 'logo' ? 'logo' : 'favicon'}? This action cannot be undone.`
    });
  };

  const closeDeletePopup = () => {
    setDeletePopup({
      isOpen: false,
      type: null,
      title: '',
      message: ''
    });
  };

  const confirmDelete = async () => {
    try {
      if (deletePopup.type === 'logo') {
        await api.delete('/branding/logo');
        setSuccess('Logo deleted successfully');
      } else {
        await api.delete('/branding/favicon');
        setSuccess('Favicon deleted successfully');
      }
      
      await fetchCurrentBranding();
      closeDeletePopup();
    } catch (error) {
      console.error(`Error deleting ${deletePopup.type}:`, error);
      setError(`Failed to delete ${deletePopup.type}`);
      closeDeletePopup();
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
            <h1 className='text-[22px] font-[600]'>Branding Settings</h1>
            <p className="text-gray-600 mb-8">Manage your logo and favicon</p>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}
            
            {/* Upload Form */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Upload New Assets
              </h2>
              <p className="text-gray-600 mb-6">Upload new logo or favicon files</p>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Logo Upload Section */}
                  <div className="border border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 transition-colors">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                      <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </span>
                      Logo
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-orange-500 bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, SVG (MAX. 5MB)
                            </p>
                          </div>
                          <input 
                            ref={logoInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                      <div className="w-full h-40 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 p-4">
                        {logoPreview ? (
                          <div className="relative group">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="max-h-28 max-w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span className="text-sm">No logo selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Favicon Upload Section */}
                  <div className="border border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 transition-colors">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                      <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </span>
                      Favicon
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Favicon</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-orange-500 bg-gray-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, ICO (MAX. 5MB)
                            </p>
                          </div>
                          <input 
                            ref={faviconInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*,.ico"
                            onChange={handleFaviconChange}
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                      <div className="w-full h-40 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 p-4">
                        {faviconPreview ? (
                          <div className="relative group">
                            <img 
                              src={faviconPreview} 
                              alt="Favicon preview" 
                              className="max-h-16 max-w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeFavicon}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span className="text-sm">No favicon selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!logoFile && !faviconFile) || uploading}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Upload Files
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Current Branding Display */}
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Current Branding</h2>
              <p className="text-gray-600 mb-6">Your currently active logo and favicon</p>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-orange-500 text-3xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Current Logo</h3>
                      {currentBranding.logo && (
                        <button
                          onClick={() => openDeletePopup('logo')}
                          className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="w-full h-56 border border-gray-300 rounded-lg flex items-center justify-center bg-white p-4">
                      {currentBranding.logo ? (
                        <img 
                          src={`${base_url}${currentBranding.logo}`} 
                          alt="Current logo" 
                          className="max-h-40 max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span>No logo currently set</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Current Favicon</h3>
                      {currentBranding.favicon && (
                        <button
                          onClick={() => openDeletePopup('favicon')}
                          className="text-red-500 hover:text-red-700 flex items-center transition-colors"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="w-full h-56 border border-gray-300 rounded-lg flex items-center justify-center bg-white p-4">
                      {currentBranding.favicon ? (
                        <img 
                          src={`${base_url}${currentBranding.favicon}`} 
                          alt="Current favicon" 
                          className="max-h-16 max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <span>No favicon currently set</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {currentBranding.lastUpdated && (
                <div className="mt-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg inline-block">
                  Last updated: {new Date(currentBranding.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Custom Delete Confirmation Popup */}
      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] backdrop-blur-md p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{deletePopup.title}</h3>
              <button
                onClick={closeDeletePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">{deletePopup.message}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeletePopup}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Logoupload;