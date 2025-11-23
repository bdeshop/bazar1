import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaEye } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const Terms = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [termsContent, setTermsContent] = useState({
    title: 'Terms and Conditions',
    lastUpdated: 'January 1, 2023',
    content: `Please replace this with your actual terms and conditions content. You can edit this section by clicking the edit button.`
  });
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(termsContent);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVersionPopup, setShowVersionPopup] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Fetch terms and version history
  useEffect(() => {
    fetchTerms();
    fetchVersionHistory();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/terms`);
      setTermsContent(response.data);
      setEditContent(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch terms:', error);
      setError('Failed to load terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionHistory = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/terms/history`);
      setVersionHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch version history:', error);
    }
  };

  const handleEdit = () => {
    setEditContent(termsContent);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(`${base_url}/api/admin/terms`, editContent);
      setTermsContent(editContent);
      setIsEditing(false);
      fetchVersionHistory(); // Refresh history after update
      setError('');
    } catch (error) {
      console.error('Failed to save terms:', error);
      setError('Failed to save terms and conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(termsContent);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditContent({
      ...editContent,
      [name]: value
    });
  };

  const handleViewVersion = async (versionId) => {
    try {
      const response = await axios.get(`${base_url}/api/admin/terms/version/${versionId}`);
      setSelectedVersion(response.data);
      setShowVersionPopup(true);
    } catch (error) {
      console.error('Failed to fetch version:', error);
      setError('Failed to load version details');
    }
  };

  const handleRestoreClick = (version) => {
    setVersionToRestore(version);
    setShowRestorePopup(true);
  };

  const handleRestoreConfirm = async () => {
    if (!versionToRestore) return;

    try {
      setRestoreLoading(true);
      await axios.post(`${base_url}/api/admin/terms/restore/${versionToRestore._id}`);
      fetchTerms(); // Refresh current terms
      fetchVersionHistory(); // Refresh history
      setError('');
      setShowRestorePopup(false);
      setVersionToRestore(null);
      
      // Show success message (you can replace this with a toast notification)
    } catch (error) {
      console.error('Failed to restore version:', error);
      setError('Failed to restore version');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleRestoreCancel = () => {
    setShowRestorePopup(false);
    setVersionToRestore(null);
  };

  const closeVersionPopup = () => {
    setShowVersionPopup(false);
    setSelectedVersion(null);
  };

  if (loading) {
    return (
      <section className="font-nunito h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
                 <div className="flex justify-center items-center py-8">
                             <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                           </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

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
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Terms and Conditions</h1>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 flex items-center transition-colors duration-200 shadow-md"
                  disabled={loading}
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 flex items-center transition-colors duration-200 shadow-md"
                    disabled={loading}
                  >
                    <FaSave className="mr-2" /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 flex items-center transition-colors duration-200 shadow-md"
                    disabled={loading}
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8 shadow-sm">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editContent.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <input
                    type="text"
                    name="lastUpdated"
                    value={editContent.lastUpdated}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                    placeholder="e.g., January 1, 2023"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    value={editContent.content}
                    onChange={handleInputChange}
                    rows="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-vertical"
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{termsContent.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Last updated: {termsContent.lastUpdated}</p>
                </div>
                
                <div className="prose max-w-none">
                  {termsContent.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Version History */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Version History</h2>
              
              {versionHistory.length === 0 ? (
                <p className="text-gray-500">No version history available.</p>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Version
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Updated On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Updated By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {versionHistory.map((version) => (
                        <tr key={version._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              {version.version}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(version.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {version.updatedBy?.name || 'Admin User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewVersion(version._id)}
                                className="px-3 py-1.5 cursor-pointer bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center transition-colors duration-200 shadow-sm"
                                disabled={loading}
                              >
                                <FaEye className="mr-1" /> View
                              </button>
                              <button 
                                onClick={() => handleRestoreClick(version)}
                                className="px-3 py-1.5 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors duration-200 shadow-sm"
                                disabled={loading}
                              >
                                <FaTrash className="mr-1" /> Restore
                              </button>
                            </div>
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

      {/* Version Details Popup */}
      {showVersionPopup && selectedVersion && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Version: {selectedVersion.version}
              </h3>
              <button
                onClick={closeVersionPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">{selectedVersion.title}</h4>
                <p className="text-sm text-gray-500 mt-1">Last updated: {selectedVersion.lastUpdated}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose max-w-none">
                  {selectedVersion.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeVersionPopup}
                className="px-4 py-2 bg-gray-500 text-white cursor-pointer rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Popup */}
      {showRestorePopup && versionToRestore && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Restore Version
              </h3>
              <button
                onClick={handleRestoreCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={restoreLoading}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to restore this version?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium mb-1">
                    Version: <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">{versionToRestore.version}</span>
                  </p>
                  <p className="text-sm text-yellow-700">
                    This will replace your current terms and conditions with this version.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Preview:</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {versionToRestore.content.substring(0, 150)}...
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleRestoreCancel}
                className="px-4 py-2 bg-gray-500 text-white cursor-pointer rounded-md hover:bg-gray-600 transition-colors duration-200"
                disabled={restoreLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreConfirm}
                className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-md hover:bg-red-700 flex items-center transition-colors duration-200"
                disabled={restoreLoading}
              >
                {restoreLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Restore Version
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Terms;