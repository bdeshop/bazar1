import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const FAQ = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general'
  });
  const [editingId, setEditingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Delete confirmation popup state
  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    faqId: null,
    faqQuestion: '',
    deleting: false
  });
  
  const categories = [
    { value: 'general', label: 'General' },
    { value: 'account', label: 'Account' },
    { value: 'payments', label: 'Payments' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'technical', label: 'Technical Support' }
  ];

  // Axios instance with base configuration
  const api = axios.create({
    baseURL: `${base_url}/api/admin`,
    headers: {
      'Content-Type': 'application/json',
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
      return Promise.reject(error);
    }
  );
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Fetch FAQs from API
  const fetchFaqs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`${base_url}/api/admin/faqs`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('Please fill in both question and answer fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        // Update existing FAQ
        await api.put(`${base_url}/api/admin/faqs/${editingId}`, formData);
        setSuccess('FAQ updated successfully');
      } else {
        // Add new FAQ
        await api.post('/faqs', formData);
        setSuccess('FAQ created successfully');
      }
      
      // Refresh the FAQs list
      await fetchFaqs();
      
      // Reset form
      setFormData({
        question: '',
        answer: '',
        category: 'general'
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      // Error is handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setEditingId(faq._id);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general'
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const toggleStatus = async (id, currentStatus) => {
    setError('');
    try {
      await api.put(`${base_url}/api/admin/faqs/${id}/status`, { status: !currentStatus });
      setSuccess('Status updated successfully');
      await fetchFaqs();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (id, question) => {
    setDeletePopup({
      isOpen: true,
      faqId: id,
      faqQuestion: question,
      deleting: false
    });
  };

  // Close delete confirmation popup
  const closeDeletePopup = () => {
    setDeletePopup({
      isOpen: false,
      faqId: null,
      faqQuestion: '',
      deleting: false
    });
  };

  // Handle FAQ deletion
  const handleDeleteFaq = async () => {
    if (!deletePopup.faqId) return;

    setDeletePopup(prev => ({ ...prev, deleting: true }));
    setError('');

    try {
      await api.delete(`/faqs/${deletePopup.faqId}`);
      setSuccess('FAQ deleted successfully');
      await fetchFaqs();
      closeDeletePopup();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setDeletePopup(prev => ({ ...prev, deleting: false }));
    }
  };

  const toggleExpand = (id) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(itemId => itemId !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };

  const filteredFaqs = (category) => {
    return faqs.filter(faq => faq.category === category && faq.status);
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">FAQ Management</h1>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            
            {/* Add/Edit FAQ Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Question Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter question"
                  />
                </div>
                
                {/* Answer Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter answer"
                  ></textarea>
                </div>
                
                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end mt-8 space-x-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    disabled={!formData.question.trim() || !formData.answer.trim() || saving}
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {editingId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingId ? 'Update FAQ' : 'Add FAQ'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* FAQ List by Category */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">FAQ List</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                </div>
              ) : (
                categories.map(category => {
                  const categoryFaqs = filteredFaqs(category.value);
                  if (categoryFaqs.length === 0) return null;
                  
                  return (
                    <div key={category.value} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">{category.label}</h3>
                      <div className="space-y-3">
                        {categoryFaqs.map(faq => (
                          <div key={faq._id} className="bg-white border border-gray-200 rounded-[5px] overflow-hidden">
                            <button
                              className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                              onClick={() => toggleExpand(faq._id)}
                            >
                              <span>{faq.question}</span>
                              {expandedItems.includes(faq._id) ? (
                                <FaChevronUp className="text-gray-500" />
                              ) : (
                                <FaChevronDown className="text-gray-500" />
                              )}
                            </button>
                            {expandedItems.includes(faq._id) && (
                              <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <p className="text-gray-600">{faq.answer}</p>
                                <div className="mt-3 flex space-x-2">
                                  <button 
                                    onClick={() => startEditing(faq)}
                                    className="px-3 py-1 text-white bg-blue-600 cursor-pointer rounded-[3px] text-sm flex items-center hover:bg-blue-700 transition-colors"
                                  >
                                    <FaEdit className="mr-1" /> Edit
                                  </button>
                                  <button 
                                    onClick={() => openDeletePopup(faq._id, faq.question)}
                                    className="px-3 py-1 text-white bg-red-600 cursor-pointer rounded-[3px] text-sm flex items-center hover:bg-red-700 transition-colors"
                                  >
                                    <FaTrash className="mr-1" /> Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* All FAQs Table for Management */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All FAQs (Management View)</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                </div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Question
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
                      {faqs.map((faq) => (
                        <tr key={faq._id}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">{faq.question}</div>
                            <div className="text-sm text-gray-500 mt-1">{faq.answer.substring(0, 100)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {categories.find(c => c.value === faq.category)?.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={faq.status}
                                onChange={() => toggleStatus(faq._id, faq.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {faq.status ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => startEditing(faq)}
                              className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3 hover:bg-blue-700 transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => openDeletePopup(faq._id, faq.question)}
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px] hover:bg-red-700 transition-colors"
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

      {/* Custom Delete Confirmation Popup */}
      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-auto transform transition-all">
            {/* Popup Header */}
            <div className="flex items-center p-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-lg" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Delete FAQ</h3>
            </div>
            
            {/* Popup Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this FAQ?
              </p>
              <p className="text-gray-900 font-medium bg-gray-100 p-3 rounded border border-gray-200">
                "{deletePopup.faqQuestion}"
              </p>
              <p className="text-red-600 text-sm mt-3">
                This action cannot be undone.
              </p>
            </div>
            
            {/* Popup Footer */}
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeDeletePopup}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors font-medium"
                disabled={deletePopup.deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFaq}
                className="px-4 py-2 text-white bg-red-600 cursor-pointer hover:bg-red-700 rounded-md transition-colors font-medium flex items-center justify-center"
                disabled={deletePopup.deleting}
              >
                {deletePopup.deleting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete FAQ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FAQ;