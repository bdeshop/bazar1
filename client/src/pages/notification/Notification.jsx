import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiChevronDown, FiBell, FiExternalLink, FiClock } from "react-icons/fi";
import axios from "axios";
import logo from "../../assets/logo.png"
const Notification = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 10) => {
    try {
      if (!token) {
        setError("Please login to view notifications");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${base_url}/api/user/notifications/${user.id}`, {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Notifications response:", response.data);
      
      if (response.data.success) {
        const responseData = response.data.data;
        
        // Handle different response structures
        if (responseData.notifications) {
          setNotifications(responseData.notifications);
          setPagination({
            page: responseData.pagination?.page || page,
            totalPages: responseData.pagination?.pages || 1,
            total: responseData.pagination?.total || responseData.notifications.length,
            limit: responseData.pagination?.limit || limit
          });
        } else if (Array.isArray(responseData)) {
          // If response.data.data is directly the array of notifications
          setNotifications(responseData);
          setPagination({
            page: 1,
            totalPages: 1,
            total: responseData.length,
            limit: limit
          });
        } else {
          // Fallback if data structure is different
          setNotifications(responseData || []);
        }
      } else {
        setError(response.data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch notifications";
      setError(errorMessage);
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Load notifications on component mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
      setError("Please login to view notifications");
    }
  }, [token]);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'warning':
        return <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-yellow-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'error':
        return <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'promotional':
        return <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>;
      default:
        return <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-900/30 flex items-center justify-center">
          <FiBell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
        </div>;
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="w-full overflow-y-auto flex items-center justify-center">
               <div className='w-full p-[20px] flex justify-center items-center'>
                         <div className="relative w-24 h-24 flex justify-center items-center">
                           <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                           <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                           </div>
                         </div>
                       </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden w-full font-poppins bg-[#0f0f0f] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] w-full">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto w-full transition-all duration-300">
          {/* Main Content Area */}
          <div className="mx-auto overflow-y-auto pb-[100px]   w-full max-w-screen-xl px-4 md:px-[50px] py-6">
            {/* Header Section */}
            <div className="flex flex-col  pt-[25px] lg:pt-[50px] sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-[18px] md:text-xl sm:text-[22px] font-[600] text-white">
                  Notifications
                </h1>
              </div>
            </div>

            {!token ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222] mb-3 sm:mb-4">
                  <FiBell className="text-lg sm:text-xl text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">Authentication Required</h3>
                <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">Please log in to view your notifications</p>
                <a 
                  href="/login" 
                  className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
                >
                  Sign In
                </a>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222] mb-3 sm:mb-4">
                  <FiBell className="text-lg sm:text-xl text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">No notifications yet</h3>
                <p className="text-gray-400 text-xs sm:text-sm">We'll notify you when something important happens.</p>
              </div>
            ) : (
              <>
                {/* Notifications List */}
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-[2px] overflow-hidden transition-all hover:border-[#3a3a3a] hover:shadow-md"
                    >
                      <div 
                        className="p-3 sm:p-4 flex items-start cursor-pointer"
                        onClick={() => toggleDropdown(notification._id)}
                      >
                        
                        <div className="flex-1">
                          <h2 className="text-sm sm:text-base font-[500] mb-1">{notification.title}</h2>
                          <p className="text-gray-400 line-clamp-2 text-xs sm:text-sm">
                            {notification.message}
                          </p>
                        </div>
                        
                        <FiChevronDown
                          className={`text-gray-500 text-base sm:text-lg transition-transform duration-300 flex-shrink-0 ml-2 mt-0.5 ${
                            openDropdowns[notification._id] ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchNotifications(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={() => fetchNotifications(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Notification;