import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmationPopup from "../../components/modal/ConfirmationPopup"

const Gamecategory = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/game-categories`);
      console.log(response)
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
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
    
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    if (!formData.image && !isEditing) {
      toast.error('Category image is required');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        response = await axios.put(`${base_url}/api/admin/game-categories/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Category updated successfully');
      } else {
        response = await axios.post(`${base_url}/api/admin/game-categories`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Category created successfully');
      }

      // Reset form
      setFormData({
        name: '',
        image: null
      });
      setImagePreview(null);
      setIsEditing(false);
      setEditingId(null);
      
      // Refresh categories list
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save category';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.put(`${base_url}/api/admin/game-categories/${id}/status`, {
        status: !currentStatus
      });
      
      setCategories(categories.map(category => 
        category._id === id ? { ...category, status: !currentStatus } : category
      ));
      
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const editCategory = (category) => {
    setFormData({
      name: category.name,
      image: null
    });
    setImagePreview(category.image);
    setIsEditing(true);
    setEditingId(category._id);
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      image: null
    });
    setImagePreview(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeletePopup(true);
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await axios.delete(`${base_url}/api/admin/game-categories/${categoryToDelete._id}`);
      
      setCategories(categories.filter(category => category._id !== categoryToDelete._id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setShowDeletePopup(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setCategoryToDelete(null);
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Game Categories</h1>
            
            {/* Add Category Form */}
            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit}>
                {/* Category Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                {/* Image Upload Section */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img 
                          src={imagePreview} 
                          alt="Category preview" 
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
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaRegFileImage className="w-8 md:w-12 h-8 mb-3 md:h-12 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">Click to upload category image</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end mt-8 space-x-4">
                  {isEditing && (
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
                    disabled={loading}
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (isEditing ? 'Update Category' : 'Add Category')}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Categories Table */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Categories</h2>
              
              {loading && categories.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                  <p className="text-gray-500">No categories found. Add your first category above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Image
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
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={`${base_url}/${category.image}`} alt={category.name} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={category.status}
                                onChange={() => toggleStatus(category._id, category.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {category.status ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="px-[8px] py-[7px] text-white bg-blue-600 cursor-pointer rounded-[3px] text-[16px] mr-3"
                              onClick={() => editCategory(category)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px]"
                              onClick={() => confirmDelete(category)}
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

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <ConfirmationPopup
          title="Delete Category"
          message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
          onConfirm={deleteCategory}
          onCancel={cancelDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </section>
  );
};

export default Gamecategory;