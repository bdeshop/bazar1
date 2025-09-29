import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiCopy, FiUsers, FiDollarSign, FiTrendingUp, FiAward, FiShare2 } from "react-icons/fi";
import QRCode from "react-qr-code";
import { Slider } from "../../components/home_componets/Slider";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
const Myreferel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("detail");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userinfo = JSON.parse(localStorage.getItem("user"));
      
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${base_url}/api/user/all-information/${userinfo.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-lg mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#141515] text-gray-900">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

    <div className="flex-1 overflow-auto w-full transition-all duration-300">
          <Slider/>

          {/* Content */}
          <div className="mx-auto overflow-y-auto  w-full max-w-screen-xl px-4 md:px-[50px] py-6">
            {/* Tabs */}
            <div className="flex space-x-6 mb-6 border-b-[1px] border-gray-600">
              <button
                onClick={() => setActiveTab("detail")}
                className={`pb-2 w-[200px] text-sm md:text-base cursor-pointer font-medium ${
                  activeTab === "detail"
                    ? "text-theme_color border-b-2 border-theme_color"
                    : "text-gray-200 hover:text-gray-700"
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-2 text-sm w-[200px] md:text-base cursor-pointer font-medium ${
                  activeTab === "info"
                    ? "text-theme_color border-b-2 border-theme_color"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Details
              </button>
            </div>

            {/* Content Area */}
            {activeTab === "detail" ? (
              <>
                {/* Referral Box */}
                <div className=" sm:py-6 rounded-lg shadow-sm  flex md:flex-row   md:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* QR */}
                  <div className="w-[200px] sm:w-[200px] sm:h-[200px] bg-white p-2  border border-gray-200 flex items-center justify-center">
                    <QRCode 
                      value={userData?.referralCode || ""} 
                      size={70}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Code & Copy */}
                  <div className="flex flex-col items-center  md:items-start flex-1">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">Your referral code</div>
                    <div className="flex items-center gap-2 font-bold text-lg sm:text-xl text-gray-900">
                      <span className="text-white">{userData?.referralCode || "N/A"}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Copy referral code"
                      >
                        <FiCopy className="text-gray-400 hover:text-blue-600" />
                      </button>
                      {copied && <span className="text-xs sm:text-sm text-green-600 ml-1">Copied!</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-center md:text-left">
                      Share this code with friends to earn rewards
                    </div>
                    <div className="grid pt-[10px] grid-cols-2 gap-2">
                           <button 
                      className="bg-theme_color px-3 sm:px-4 py-2.5 text-xs sm:text-sm  text-white flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                      onClick={() => {
                        navigator.share?.({
                          title: 'Join me!',
                          text: 'Use my referral code to sign up',
                          url: `https://yourapp.com/ref/${userData?.referralCode || ""}`
                        }).catch(() => copyToClipboard());
                      }}
                    >
                      <FiShare2 size={12} className="sm:size-[14px]" />
                      Copy Link
                    </button>
                           <button 
                      className="bg-theme_color px-3 sm:px-4 py-2.5 text-xs sm:text-sm  text-white flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                      onClick={() => {
                        navigator.share?.({
                          title: 'Join me!',
                          text: 'Use my referral code to sign up',
                          url: `https://yourapp.com/ref/${userData?.referralCode || ""}`
                        }).catch(() => copyToClipboard());
                      }}
                    >
                      <FiShare2 size={12} className="sm:size-[14px]" />
                      Share
                    </button>
                    </div>
                  </div>
           
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 bg-[#22A27B] p-[20px]">
                  {/* Active Downlines */}
                  <div className="bg-[#222424] p-4 sm:p-5  shadow-sm border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs sm:text-sm text-gray-400">Active downlines</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      {userData?.referralUsers?.length || 0}
                    </div>
                  </div>

                  {/* Lifetime Cash Rewards */}
                  <div className="bg-[#222424] p-4 sm:p-5  shadow-sm border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs sm:text-sm text-gray-400">Lifetime rewards</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                     ৳{userData?.referralEarnings || 0}
                    </div>
                  </div>

                  {/* Referral Turnover */}
                  <div className="bg-[#222424] p-4 sm:p-5  shadow-sm border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs sm:text-sm text-gray-400">Referral turnover</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      ৳{userData?.referralEarnings || 0}
                    </div>
                  </div>

                  {/* Cash Rewards */}
                  <div className="bg-[#222424] p-4 sm:p-5 shadow-sm border border-gray-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs sm:text-sm text-gray-400">Cash rewards</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                     ৳{userData?.referralEarnings || 0}
                    </div>
                  </div>
                </div>

                {/* Referred Users Table */}
                {userData?.referralUsers?.length > 0 ? (
                  <div className="bg-[#23AA81] p-4 sm:p-6  shadow-sm border border-gray-700 mb-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 text-white">Referred Users</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium">User ID</th>
                            <th className="text-left py-3 px-2 sm:px-4 text-gray-400 font-medium">Joined Date</th>
                            <th className="text-right py-3 px-2 sm:px-4 text-gray-400 font-medium">Earned Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userData.referralUsers.map((ref, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                              <td className="py-3 px-2 sm:px-4 text-white">
                                {ref.user?.$oid ? ref.user.$oid.substring(0, 8) + "..." : "N/A"}
                              </td>
                              <td className="py-3 px-2 sm:px-4 text-gray-300">
                                {new Date(ref.joinedAt?.$date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-2 sm:px-4 text-right font-medium text-white">
                                ${ref.earnedAmount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#23AA81] p-6  shadow-sm border border-gray-700 mb-6 text-center">
                    <h3 className="text-base sm:text-lg font-medium text-yellow-300 mb-1">No referrals yet</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Share your referral code to start earning rewards</p>
                  </div>
                )}

                {/* History Button */}
                <div className="flex justify-end">
                  <button className="bg-theme_color px-3 sm:px-4 py-2.5 cursor-pointer text-xs sm:text-sm  text-white transition-colors">
                    Cash reward history
                  </button>
                </div>
              </>
            ) : (
              // Info Tab Content
              <div className="bg-[#222424] p-4 sm:p-6 shadow-sm border border-gray-700 text-gray-300">
                <h2 className="text-[18px] sm:text-[20px] font-[500] text-white mb-4 sm:mb-6">How Our Referral Program Works</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="py-2 rounded-lg ">
                    <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <span className="bg-blue-900/30 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs sm:text-sm">1</span>
                      Share Your Code
                    </h3>
                    <p className="text-xs sm:text-sm">Share your unique referral code with friends. They'll use it when signing up for your app.</p>
                  </div>
                  
                  <div className=" py-2 rounded-lg">
                    <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <span className="bg-blue-900/30 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs sm:text-sm">2</span>
                      Earn Rewards
                    </h3>
                    <p className="text-xs sm:text-sm">When your friend makes their first deposit or completes qualifying activities, you'll earn rewards.</p>
                  </div>
                  
                  <div className=" py-2 ">
                    <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                      <span className="bg-blue-900/30 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs sm:text-sm">3</span>
                      Track Your Earnings
                    </h3>
                    <p className="text-xs sm:text-sm">Monitor your referral earnings and statistics in real-time on this dashboard.</p>
                  </div>
                  
                  <div className=" py-2 rounded-lg">
                    <h3 className="font-medium text-yellow-400 mb-2">Terms & Conditions</h3>
                    <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1 text-xs sm:text-sm">
                      <li>Referral rewards are subject to terms and conditions</li>
                      <li>Abuse of the referral system may result in account suspension</li>
                      <li>Rewards may take up to 24 hours to appear in your account</li>
                      <li>Minimum withdrawal limits may apply to referral earnings</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Footer />

        </div>
        
      </div>
    </div>
  );
};

export default Myreferel;