import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlinePlus, AiOutlineRollback, AiOutlineCamera } from "react-icons/ai";
import Swal from "sweetalert2";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';

const Newdepositmethod = () => {
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
    accountNumber: "",
    accountType: "Agent",
    depositInstruction: "",
    userData: [],
    createdbyid: admin_info.id,
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
      cancelButtonColor: "#ea580c",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#ffffff",
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
        !formData.minAmount || !formData.maxAmount || !formData.accountNumber) {
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
        `${base_url}/api/admin/manual-payment`,
        form_data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
        background: "#ffffff",
        color: "#1f2937"
      }).then(() => {
        navigate(-1);
      });
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Failed to add payment method");
    }
  };

  return (
    <section className="font-poppins h-screen bg-white">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="p-6">
            
            <form onSubmit={handleSubmit} className="bg-white rounded-xl  p-6 border border-orange-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Add Manual Gateway</h1>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">Gateway Image</label>
                <div className="relative w-40 h-40 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Gateway" className="w-full h-full object-contain" />
                  ) : (
                    <AiOutlineCamera className="text-gray-400 text-4xl" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Gateway Name *</label>
                  <input
                    type="text"
                    name="gatewayName"
                    value={formData.gatewayName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                    placeholder='Name'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Currency *</label>
                  <input
                    type="text"
                    name="currencyName"
                    value={formData.currencyName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Rate (1 USD = ?) *</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Rate"
                      required
                    />
                    <span className="bg-orange-600 px-4 py-2 rounded-r-lg border border-orange-600 text-white">
                      {formData.currencyName || 'CUR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h2 className="text-lg font-medium mb-4 text-orange-600">Amount Range</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Minimum Amount *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="minAmount"
                        value={formData.minAmount}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <span className="bg-orange-600 px-4 py-2 rounded-r-lg border border-orange-600 text-white">BDT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Maximum Amount *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="maxAmount"
                        value={formData.maxAmount}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <span className="bg-orange-600 px-4 py-2 rounded-r-lg border border-orange-600 text-white">BDT</span>
                    </div>
                  </div>
                </div>

                {/* Charges */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h2 className="text-lg font-medium mb-4 text-orange-600">Charges</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Fixed Charge *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="fixedCharge"
                        value={formData.fixedCharge}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <span className="bg-orange-600 px-4 py-2 rounded-r-lg border border-orange-600 text-white">BDT</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Percent Charge *</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="percentCharge"
                        value={formData.percentCharge}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-orange-300 rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                      <span className="bg-orange-600 px-4 py-2 rounded-r-lg border border-orange-600 text-white">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                <h2 className="text-lg font-medium mb-4 text-orange-600">Bank Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Account Number *</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Account Type *</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="Agent">Agent</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deposit Instructions */}
              <div className="mb-6">
                <label className="block text-lg font-medium mb-2 text-orange-600">Deposit Instructions</label>
                <textarea
                  name="depositInstruction"
                  value={formData.depositInstruction}
                  onChange={handleInputChange}
                  className="w-full h-40 bg-white border border-orange-300 rounded-lg p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter detailed deposit instructions..."
                />
              </div>

              {/* User Data Fields */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-orange-600">User Data Fields</h2>
                  <button
                    type="button"
                    onClick={() => setShowPopup(true)}
                    className="flex items-center bg-orange-600 hover:bg-orange-700 cursor-pointer text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Field
                  </button>
                </div>
                
                {formData.userData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-orange-300">
                      <thead className="bg-orange-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-white">Type</th>
                          <th className="px-4 py-2 text-left text-white">Required</th>
                          <th className="px-4 py-2 text-left text-white">Label</th>
                          <th className="px-4 py-2 text-left text-white">Width</th>
                          <th className="px-4 py-2 text-left text-white">Instruction</th>
                          <th className="px-4 py-2 text-left text-white">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.userData.map((field, index) => (
                          <tr key={index} className="border-b border-orange-200 hover:bg-orange-50 transition-colors">
                            <td className="px-4 py-2 text-gray-700">{field.type}</td>
                            <td className="px-4 py-2 text-gray-700">{field.isRequired}</td>
                            <td className="px-4 py-2 text-gray-700">{field.label}</td>
                            <td className="px-4 py-2 text-gray-700">{field.width}</td>
                            <td className="px-4 py-2 text-gray-700">{field.instruction || "-"}</td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteField(index)}
                                className="text-orange-600 hover:text-orange-800 transition-colors"
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
                  <div className="text-center py-4 text-gray-500 border border-orange-200 rounded-lg">
                    No fields added yet
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer font-[400] text-white py-3 rounded-lg  transition-colors"
              >
                Submit Gateway
              </button>
            </form>

            {/* Add Field Modal */}
            {showPopup && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-[10000] p-4">
                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-orange-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Field</h3>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="text-gray-500 hover:text-orange-600 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Field Type *</label>
                      <select
                        name="type"
                        value={fieldForm.type}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="text">Text</option>
                        <option value="file">File</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Required *</label>
                      <select
                        name="isRequired"
                        value={fieldForm.isRequired}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select Option</option>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Label *</label>
                      <input
                        type="text"
                        name="label"
                        value={fieldForm.label}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Field label"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Width *</label>
                      <select
                        name="width"
                        value={fieldForm.width}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select Width</option>
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Instructions</label>
                      <input
                        type="text"
                        name="instruction"
                        value={fieldForm.instruction}
                        onChange={handleFieldFormChange}
                        className="w-full bg-white border border-orange-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Help text (optional)"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="px-4 py-2 border border-orange-300 cursor-pointer rounded-lg text-gray-700 hover:bg-orange-50 transition-colors"
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

export default Newdepositmethod;