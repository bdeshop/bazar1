import React, { useState, useEffect } from 'react';
import { FaEyeSlash, FaEye, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import loader from "../../../assets/loading.gif"
const Alldepositmethods = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [depositGateways, setDepositGateways] = useState([]);
  const navigate = useNavigate();
  const admin_info = JSON.parse(localStorage.getItem("admin"));

  useEffect(() => {
    fetchDepositMethods();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchDepositMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/deposit-methods/${admin_info.id}`);
      setDepositGateways(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load deposit methods");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axios.put(
        `${base_url}/api/admin/manual/status/${id}`,
        { enabled: newStatus }
      );

      Swal.fire({
        title: "Success",
        text: response.data.message,
        icon: "success",
        background: "#fff",
        color: "#1f2937"
      });

      setDepositGateways(depositGateways.map(gateway => 
        gateway._id === id ? { ...gateway, enabled: newStatus } : gateway
      ));

    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update status.",
        icon: "error",
        background: "#fff",
        color: "#1f2937"
      });
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/edit-payment-method/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        background: "#fff",
        color: "#1f2937"
      });

      if (confirm.isConfirmed) {
        const response = await axios.delete(`${base_url}/api/admin/deposit-methods/${id}`);
        
        Swal.fire({
          title: "Deleted!",
          text: response.data.message,
          icon: "success",
          background: "#fff",
          color: "#1f2937"
        });

        setDepositGateways(depositGateways.filter(gateway => gateway._id !== id));
      }
    } catch (error) {
      console.error("Error deleting method:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete the deposit method.",
        icon: "error",
        background: "#fff",
        color: "#1f2937"
      });
    }
  };

  if (loading) {
    return (
      <section className="font-poppins h-screen bg-white">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}>
            <div className="flex justify-center items-center h-full">
             <img src={loader} className='w-[65px]' alt="" />
            </div>
          </main>
        </div>
      </section>
    );
  }

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
          <div className="w-full">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Deposit Methods</h1>
                <p className="text-gray-600 mt-1">Manage your payment gateways and deposit methods</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-[5px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Total Methods</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{depositGateways.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaPlus className="text-white text-lg" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-[5px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Methods</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {depositGateways.filter(gateway => gateway.enabled).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <FaEye className="text-white text-lg" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-[5px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Inactive Methods</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {depositGateways.filter(gateway => !gateway.enabled).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <FaEyeSlash className="text-white text-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[5px]  overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-orange-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Currency / Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Amount Range
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {depositGateways.length > 0 ? (
                      depositGateways.map((gateway) => (
                        <tr key={gateway._id} className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {gateway.image && (
                                <img 
                                  src={`${base_url}/images/${gateway.image}`} 
                                  alt={gateway.gatewayName} 
                                  className="h-12 w-12 rounded-lg object-cover mr-4 border border-gray-200"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900">{gateway.gatewayName}</div>
                                <div className="text-gray-500 text-sm mt-1">{gateway.accountType}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{gateway.currencyName}</div>
                            <div className="text-sm text-gray-500">Rate: {gateway.rate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ৳{gateway.minAmount} - ৳{gateway.maxAmount}
                            </div>
                            <div className="text-sm text-gray-500">
                              Charge: ৳{gateway.fixedCharge} + {gateway.percentCharge}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              gateway.enabled 
                                ? "bg-green-800 text-white" 
                                : "bg-red-800 text-white"
                            }`}>
                              {gateway.enabled ? (
                                <>
                                  <FaEye className="mr-1" /> Active
                                </>
                              ) : (
                                <>
                                  <FaEyeSlash className="mr-1" /> Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(gateway._id, gateway.enabled)}
                                className={`inline-flex items-center px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors ${
                                  gateway.enabled
                                    ? "bg-red-700 text-white hover:bg-red-800"
                                    : "bg-green-700 text-white hover:bg-green-800"
                                }`}
                              >
                                {gateway.enabled ? (
                                  <>
                                    Disable
                                  </>
                                ) : (
                                  <>
                                     Enable
                                  </>
                                )}
                              </button>
                            
                              {/* <button
                                onClick={() => handleEdit(gateway._id)}
                                className="inline-flex items-center px-3 py-2 bg-blue-700 text-white cursor-pointer hover:bg-blue-800 rounded-md transition-colors"
                              >
                                 Edit
                              </button> */}

                              <button
                                onClick={() => handleDelete(gateway._id)}
                                className="inline-flex items-center px-3 py-2 bg-red-700 text-white cursor-pointer text-sm hover:bg-red-800 rounded-md transition-colors"
                              >
                                 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No deposit methods found</h3>
                            <p className="text-gray-500 mb-4">Get started by adding your first payment gateway</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            {depositGateways.length > 0 && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <FaEye className="text-white text-sm" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-800">Manage Deposit Methods</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Enable or disable payment gateways, edit their settings, or remove them entirely. 
                      Active methods will be available to users for deposits.
                    </p>
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

export default Alldepositmethods;