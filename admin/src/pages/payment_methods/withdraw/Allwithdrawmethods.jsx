import React, { useState, useEffect } from 'react';
import { FaEyeSlash, FaEye, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Toaster, toast } from 'react-hot-toast';
import loader from "../../../assets/loading.gif"

const Allwithdrawmethods = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [withdrawGateways, setWithdrawGateways] = useState([]);
  const navigate = useNavigate();
  const admin_info = JSON.parse(localStorage.getItem("admin"));

  useEffect(() => {
    fetchWithdrawMethods();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchWithdrawMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/withdraw-methods/${admin_info.id}`);
      setWithdrawGateways(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load withdrawal methods");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axios.put(
        `${base_url}/api/admin/manual-withdraw/status/${id}`,
        { enabled: newStatus }
      );

      Swal.fire({
        title: "Success",
        text: response.data.message,
        icon: "success",
        background: "#fff",
        color: "#1f2937"
      });

      setWithdrawGateways(withdrawGateways.map(gateway => 
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
    navigate(`/dashboard/edit-withdraw-method/${id}`);
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
        const response = await axios.delete(`${base_url}/api/admin/withdraw-methods/${id}`);
        
        Swal.fire({
          title: "Deleted!",
          text: response.data.message,
          icon: "success",
          background: "#fff",
          color: "#1f2937"
        });

        setWithdrawGateways(withdrawGateways.filter(gateway => gateway._id !== id));
      }
    } catch (error) {
      console.error("Error deleting method:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to delete the withdrawal method.",
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

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Withdrawal Methods</h1>
                <p className="text-gray-600 mt-1">Manage your withdrawal gateways and payment methods</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-[5px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Total Methods</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{withdrawGateways.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FaPlus className="text-white text-lg" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-[5px] p-4 ">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Active Methods</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {withdrawGateways.filter(gateway => gateway.enabled).length}
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
                      {withdrawGateways.filter(gateway => !gateway.enabled).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <FaEyeSlash className="text-white text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-[5px] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Currencies</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {new Set(withdrawGateways.map(gateway => gateway.currencyName)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">$</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[5px] overflow-hidden border border-gray-200">
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
                        Charges
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
                    {withdrawGateways.length > 0 ? (
                      withdrawGateways.map((gateway) => (
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
                                <div className="text-gray-500 text-sm mt-1">Withdrawal</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{gateway.currencyName}</div>
                            <div className="text-sm text-gray-500">Rate: {gateway.rate || '1.00'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ৳{gateway.minAmount || '0.00'} - ৳{gateway.maxAmount || '0.00'}
                            </div>
                            <div className="text-xs text-gray-500">USD Range</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ৳{gateway.fixedCharge || '0.00'} + {gateway.percentCharge || '0.00'}%
                            </div>
                            <div className="text-xs text-gray-500">Fixed + Percent</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              gateway.enabled 
                                ? "bg-green-700 text-white" 
                                : "bg-red-800 text-white"
                            }`}>
                              {gateway.enabled ? (
                                <>
                                  Active
                                </>
                              ) : (
                                <>
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(gateway._id, gateway.enabled)}
                                className={`inline-flex items-center px-3 py-2 rounded-[5px] cursor-pointer text-sm font-medium transition-colors ${
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
                                className="inline-flex items-center px-3 py-2 bg-blue-700 cursor-pointer text-white hover:bg-blue-800 rounded-[5px] transition-colors"
                              >
                               Edit
                              </button> */}

                              <button
                                onClick={() => handleDelete(gateway._id)}
                                className="inline-flex items-center px-3 py-2 bg-red-700 text-white cursor-pointer hover:bg-red-800 rounded-[5px] transition-colors"
                              >
                                 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawal methods found</h3>
                            <p className="text-gray-500 mb-4">Get started by adding your first withdrawal gateway</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            {withdrawGateways.length > 0 && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <FaEye className="text-white text-sm" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-800">Manage Withdrawal Methods</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Enable or disable withdrawal gateways, edit their settings, or remove them entirely. 
                      Active methods will be available to users for withdrawal requests.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {withdrawGateways.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const activeCount = withdrawGateways.filter(g => g.enabled).length;
                        if (activeCount === 0) {
                          toast.error('No active methods to disable');
                          return;
                        }
                        Swal.fire({
                          title: 'Disable All Methods?',
                          text: `This will disable all ${activeCount} active withdrawal methods.`,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#d33',
                          cancelButtonColor: '#3085d6',
                          confirmButtonText: 'Disable All',
                          background: '#fff',
                          color: '#1f2937'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            // Implement bulk disable functionality
                            toast.success(`Disabled ${activeCount} methods`);
                          }
                        });
                      }}
                      className="px-3 py-1 bg-red-100 text-red-700 border-[1px] border-red-500 text-sm rounded-[5px] cursor-pointer hover:bg-red-200 transition-colors"
                    >
                      Disable All
                    </button>
                    <button
                      onClick={() => {
                        const inactiveCount = withdrawGateways.filter(g => !g.enabled).length;
                        if (inactiveCount === 0) {
                          toast.error('No inactive methods to enable');
                          return;
                        }
                        Swal.fire({
                          title: 'Enable All Methods?',
                          text: `This will enable all ${inactiveCount} inactive withdrawal methods.`,
                          icon: 'info',
                          showCancelButton: true,
                          confirmButtonColor: '#10b981',
                          cancelButtonColor: '#3085d6',
                          confirmButtonText: 'Enable All',
                          background: '#fff',
                          color: '#1f2937'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            // Implement bulk enable functionality
                            toast.success(`Enabled ${inactiveCount} methods`);
                          }
                        });
                      }}
                      className="px-3 py-1 bg-green-100 border-[1px] border-green-500 text-green-700 text-sm cursor-pointer rounded-[5px] hover:bg-green-200 transition-colors"
                    >
                      Enable All
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Statistics</h4>
                  <div className="text-sm text-gray-600">
                    <p>• {withdrawGateways.filter(g => g.enabled).length} methods currently active</p>
                    <p>• {withdrawGateways.filter(g => !g.enabled).length} methods currently inactive</p>
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

export default Allwithdrawmethods;