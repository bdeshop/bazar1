import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiBell, FiUser, FiLock, FiCheckCircle, FiFileText, FiTrendingUp, FiUsers } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdSportsSoccer } from "react-icons/md";
import logo from "../../assets/logo.png";

const menuItems = [
  { id: "notifications", label: "Notifications", desc: "View your latest updates and alerts", icon: <FiBell />, path: "/member/inbox/notification" },
  { id: "personal-info", label: "Personal info", desc: "Manage your profile details", icon: <FiUser />, path: "/member/profile/info" },
  { id: "login-security", label: "Login & Security", desc: "Update password and security settings", icon: <FiLock />, path: "/member/profile/account" },
  { id: "verification", label: "Verification", desc: "Verify your account status", icon: <FiCheckCircle />, path: "/member/profile/verify" },
  { id: "transactions", label: "Transaction records", desc: "Review your financial transactions", icon: <FiFileText />, path: "/member/transaction-records" },
  { id: "betting-records", label: "Betting records", desc: "Check your betting history", icon: <MdSportsSoccer />, path: "/member/betting-records/settled" },
  { id: "turnover", label: "Turnover", desc: "Track your turnover progress", icon: <FiTrendingUp />, path: "/member/turnover/uncomplete" },
  { id: "referral", label: "My referral", desc: "Manage your referral program", icon: <FiUsers />, path: "/referral-program/details" },
];

const Mprofile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // Fetch user data
  const checkAuthAndFetchData = async () => {
    if (!token) {
      setError("Please login to view your profile");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch user data
      const userResponse = await axios.get(`${base_url}/api/user/my-information`);
      if (userResponse.data.success) {
        setUserData(userResponse.data.data);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch data";
      setError(errorMessage);
      console.error("Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    checkAuthAndFetchData();
  }, [token, user.id]);

  // Handle menu item click
  const handleMenuClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} menuItems={menuItems} />
          <div className='w-full p-[20px] flex justify-center items-center'>
            <div className="relative w-24 h-24 flex justify-center items-center">
              <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
              <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                <img className='w-16' src={logo} alt="Loading..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden w-full font-poppins bg-[#0f0f0f] text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] w-full">
        <Sidebar sidebarOpen={sidebarOpen} menuItems={menuItems} />
        <div className="flex-1 overflow-auto w-full transition-all duration-300">
          <div className="mx-auto w-full pb-[100px] sm:max-w-[95%] lg:max-w-screen-lg px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-round-icon-vector-illustration-graphic-design-135443422.jpg"
                  alt="Profile"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-green-500"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-[500]">{userData?.username || "User"}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium">Balance:</span>
                    <span className="text-white font-semibold">
                      ৳{userData?.balance?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
              {/* Menu Items Boxes */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMenuClick(item.path)}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 sm:p-5 flex flex-col items-start gap-3 hover:bg-[#222] hover:border-[#3a3a3a] cursor-pointer transition-all duration-200 "
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl sm:text-3xl text-theme_color">{item.icon}</div>
                      <span className="text-sm sm:text-base font-medium">{item.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4 text-center">
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            {!token && (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222] mb-3 sm:mb-4">
                  <FiBell className="text-lg sm:text-xl text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">Authentication Required</h3>
                <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">Please log in to view your profile</p>
                <a
                  href="/login"
                  className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Mprofile;