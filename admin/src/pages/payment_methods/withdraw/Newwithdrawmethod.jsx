import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlinePlus, AiOutlineRollback, AiOutlineCamera } from "react-icons/ai";
import Swal from "sweetalert2";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';

const Newwithdrawmethod = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const admin_info = JSON.parse(localStorage.getItem("admin"));
  
  // Form state
  const [formData, setFormData] = useState({
    image: null,
    gatewayName: "",
    currencyName: "",
    minAmount: "",
    maxAmount: "",
    fixedCharge: "",
    percentCharge: "",
    rate: "",
    depositInstruction: "",
    userData: [],
    createdbyid: admin_info.id
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [fieldForm, setFieldForm] = useState({
    type: "",
    isRequired: "",
    label: "",
    width: "",
    instruction: ""
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleFieldFormChange = (e) => {
    const { name, value } = e.target;
    setFieldForm({...fieldForm, [name]: value});
  };

  const handleAddField = () => {
    if (!fieldForm.type || !fieldForm.isRequired || !fieldForm.label || !fieldForm.width) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setFormData({
      ...formData,
      userData: [...formData.userData, fieldForm]
    });
    
    setFieldForm({
      type: "",
      isRequired: "",
      label: "",
      width: "",
      instruction: ""
    });
    
    setShowPopup(false);
    toast.success("New field added successfully");
  };

  const handleDeleteField = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This field will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#fff",
      color: "#1f2937"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedFields = formData.userData.filter((_, i) => i !== index);
        setFormData({...formData, userData: updatedFields});
        toast.success("Field deleted successfully");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.gatewayName || !formData.currencyName || !formData.rate || 
        !formData.minAmount || !formData.maxAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    const form_data = new FormData();
    for (const key in formData) {
      if (key === "userData") {
        form_data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        form_data.append(key, formData[key]);
      }
    }

    try {
      const res = await axios.post(
        `${base_url}/api/admin/manual-withdraw`,
        form_data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
        background: "#fff",
        color: "#1f2937"
      }).then(() => {
        navigate(-1);
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to add withdrawal method");
    }
  };

  return (
    <section className="font-poppins h-screen bg-white">
      <Header toggleSidebar={toggleSidebar} />
      <Toaster position="top-right" />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl  p-6 border border-orange-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add Withdrawal Method</h1>
                  <p className="text-gray-600 mt-1">Create a new withdrawal gateway for your users</p>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2 text-gray-900">Method Image</label>
                <div className="relative w-40 h-40 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center  transition-colors">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Gateway" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <AiOutlineCamera className="text-orange-400 text-3xl mx-auto mb-2" />
                      <p className="text-xs text-orange-600">Click to upload image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Method Name *</label>
                  <input
                    type="text"
                    name="gatewayName"
                    value={formData.gatewayName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Currency *</label>
                  <input
                    type="text"
                    name="currencyName"
                    value={formData.currencyName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="BDT"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Rate (1 USD = ?) *</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="1.00"
                      step="0.01"
                      required
                    />
                    <span className="bg-orange-600 text-white px-4 py-3 rounded-r-lg border border-orange-600 font-medium">
                      {formData.currencyName || 'CUR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Range & Charges */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Amount Range */}
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <h2 className="text-lg font-semibold mb-4 text-orange-800">Amount Range</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">Minimum Amount *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="minAmount"
                        value={formData.minAmount}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                      <span className="bg-orange-600 text-white px-4 py-3 rounded-r-lg border border-orange-600 font-medium">BDT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Maximum Amount *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="maxAmount"
                        value={formData.maxAmount}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                      <span className="bg-orange-600 text-white px-4 py-3 rounded-r-lg border border-orange-600 font-medium">BDT</span>
                    </div>
                  </div>
                </div>

                {/* Charges */}
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <h2 className="text-lg font-semibold mb-4 text-orange-800">Charges</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-900">Fixed Charge *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="fixedCharge"
                        value={formData.fixedCharge}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                      <span className="bg-orange-600 text-white px-4 py-3 rounded-r-lg border border-orange-600 font-medium">BDT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Percent Charge *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="percentCharge"
                        value={formData.percentCharge}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                      <span className="bg-orange-600 text-white px-4 py-3 rounded-r-lg border border-orange-600 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawal Instructions */}
              <div className="mb-8">
                <label className="block text-lg font-semibold mb-3 text-orange-800">Withdrawal Instructions</label>
                <textarea
                  name="depositInstruction"
                  value={formData.depositInstruction}
                  onChange={handleInputChange}
                  className="w-full h-40 bg-white border border-orange-300 rounded-lg p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter detailed withdrawal instructions for users..."
                />
              </div>

              {/* User Data Fields */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-orange-800">User Data Fields</h2>
                    <p className="text-sm text-gray-600 mt-1">Add custom fields for user information</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPopup(true)}
                    className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-[5px] transition-colors cursor-pointer"
                  >
                     Add Field
                  </button>
                </div>
                
                {formData.userData.length > 0 ? (
                  <div className="overflow-x-auto border border-orange-200 rounded-lg">
                    <table className="min-w-full divide-y divide-orange-200">
                      <thead className="bg-orange-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Required</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Width</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Instruction</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-orange-200">
                        {formData.userData.map((field, index) => (
                          <tr key={index} className="hover:bg-orange-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{field.type}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                field.isRequired === 'required' 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {field.isRequired}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{field.label}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{field.width}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{field.instruction || "-"}</td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                type="button"
                                onClick={() => handleDeleteField(index)}
                                className="text-red-600 hover:text-red-800 transition-colors font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                    <AiOutlinePlus className="text-orange-400 text-3xl mx-auto mb-2" />
                    <p className="text-gray-600">No fields added yet</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg font-[400] text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Create Withdrawal Method
              </button>
            </form>

            {/* Add Field Modal */}
            {showPopup && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg border border-orange-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Add New Field</h3>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Field Type *</label>
                      <select
                        name="type"
                        value={fieldForm.type}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="text">Text</option>
                        <option value="file">File</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Required *</label>
                      <select
                        name="isRequired"
                        value={fieldForm.isRequired}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      >
                        <option value="">Select Option</option>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Label *</label>
                      <input
                        type="text"
                        name="label"
                        value={fieldForm.label}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Field label"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Width *</label>
                      <select
                        name="width"
                        value={fieldForm.width}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        required
                      >
                        <option value="">Select Width</option>
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Instructions</label>
                      <input
                        type="text"
                        name="instruction"
                        value={fieldForm.instruction}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Help text (optional)"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 cursor-pointer text-white rounded-lg transition-colors"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
};

export default Newwithdrawmethod;