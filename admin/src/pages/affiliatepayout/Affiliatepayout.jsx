import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSave, FaSync } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import toast,{Toaster} from 'react-hot-toast';

const Affiliatepayout = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    affilaiteamount: '',
    masteraffiliateamount: ''
  });
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch current payout configuration on component mount
  useEffect(() => {
    fetchPayoutConfig();
  }, []);

  const fetchPayoutConfig = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${base_url}/api/admin/affiliate-payouts`);
      const result = await response.json();
      
      if (response.ok) {
        if (result.data) {
          setFormData({
            affilaiteamount: result.data.affilaiteamount.toString(),
            masteraffiliateamount: result.data.masteraffiliateamount.toString()
          });
        }
      } else {
        toast.error(result.error || 'Failed to fetch payout configuration');
      }
    } catch (error) {
      console.error('Error fetching payout config:', error);
      toast.error('Error fetching payout configuration');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.affilaiteamount || parseFloat(formData.affilaiteamount) < 0) {
      toast.error('Please enter a valid affiliate amount');
      return;
    }

    if (!formData.masteraffiliateamount || parseFloat(formData.masteraffiliateamount) < 0) {
      toast.error('Please enter a valid master affiliate amount');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        affilaiteamount: parseFloat(formData.affilaiteamount),
        masteraffiliateamount: parseFloat(formData.masteraffiliateamount)
      };

      const response = await fetch(`${base_url}/api/admin/affiliate-payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || 'Payout configuration saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save payout configuration');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving payout configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      affilaiteamount: '',
      masteraffiliateamount: ''
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete the payout configuration? This action cannot be undone.')) {
      setLoading(true);
      try {
        const response = await fetch(`${base_url}/api/admin/affiliate-payouts`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
          toast.success(result.message || 'Payout configuration deleted successfully!');
          setFormData({
            affilaiteamount: '',
            masteraffiliateamount: ''
          });
        } else {
          toast.error(result.error || 'Failed to delete payout configuration');
        }
      } catch (error) {
        console.error('Error deleting payout config:', error);
        toast.error('Error deleting payout configuration');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <Toaster/>
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Affiliate Payout Configuration</h1>
            </div>
            
            <div className="bg-white rounded-[5px]  p-6 border border-orange-100">
              <form onSubmit={handleSubmit}>
                {/* Affiliate Amount Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affiliate Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="affilaiteamount"
                      value={formData.affilaiteamount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color pr-12"
                      placeholder="Enter affiliate amount"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500">৳</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The payout amount for regular affiliates
                  </p>
                </div>
                
                {/* Master Affiliate Amount Field */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master Affiliate Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="masteraffiliateamount"
                      value={formData.masteraffiliateamount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color pr-12"
                      placeholder="Enter master affiliate amount"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500">৳</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The payout amount for master affiliates
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <div>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading || (!formData.affilaiteamount && !formData.masteraffiliateamount)}
                      className="px-4 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Configuration
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-500 text-white cursor-pointer font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Reset
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-orange-500 text-white cursor-pointer font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Configuration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Current Configuration Display */}
            <div className="bg-white rounded-[5px]  p-6 border border-green-100 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Configuration</h2>
              {fetching ? (
             <div className="flex justify-center items-center py-8">
                                         <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                                       </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-[5px] border-[1px] border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600">Affiliate Amount</h3>
                    <p className="text-xl font-bold text-gray-800">
                      {formData.affilaiteamount ? `৳${formData.affilaiteamount}` : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-[5px] border-[1px] border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600">Master Affiliate Amount</h3>
                    <p className="text-xl font-bold text-gray-800">
                      {formData.masteraffiliateamount ? `৳${formData.masteraffiliateamount}` : 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Affiliatepayout;