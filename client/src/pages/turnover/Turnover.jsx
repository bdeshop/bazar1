import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaFolderOpen, FaTrophy, FaRunning, FaCheckCircle } from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Turnover = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Calculate turnover progress
  const calculateTurnoverProgress = () => {
    if (!userData) return { progress: 0, requiredBet: 0, currentBet: 0, isCompleted: false };
    
    const totalDeposit = userData.total_deposit || 0;
    const totalBet = userData.total_bet || 0;
    const requiredBet = totalDeposit * 3; // 3x turnover requirement
    const progress = totalBet >= requiredBet ? 100 : (totalBet / requiredBet) * 100;
    
    return {
      progress: Math.min(progress, 100),
      requiredBet,
      currentBet: totalBet,
      isCompleted: progress >= 100
    };
  };

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

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const turnoverData = calculateTurnoverProgress();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Area */}
        <div className="w-full">
          <div className="mx-auto min-h-screen overflow-y-auto w-full max-w-screen-xl md:px-4 py-4">
            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">Turnover</h2>

            {/* Tabs */}
            <div className="flex items-center border-b border-gray-700 mb-6">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "active"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("active")}
              >
                Active
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "completed"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
              </button>
              <div className="flex-grow" />
            </div>

            {loading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="text-gray-400 mt-4">Loading turnover data...</p>
              </div>
            ) : error ? (
              // Error State
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-w-md">
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={checkAuthAndFetchData}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              // Main Content
              <div className="space-y-6">
                {/* Turnover Progress Box */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <GiCash className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Turnover Progress</h3>
                        <p className="text-gray-400 text-sm">
                          Complete 3x your deposit amount in betting
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      turnoverData.isCompleted 
                        ? 'bg-green-900/30 text-green-400 border border-green-700' 
                        : 'bg-blue-900/30 text-blue-400 border border-blue-700'
                    }`}>
                      {turnoverData.isCompleted ? 'Completed' : 'In Progress'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">
                        {turnoverData.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          turnoverData.isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        }`}
                        style={{ width: `${turnoverData.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <GiCash className="text-green-400" />
                        <span className="text-gray-400 text-sm">Total Deposit</span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {formatCurrency(userData.total_deposit || 0)} {userData.currency}
                      </p>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <FaRunning className="text-blue-400" />
                        <span className="text-gray-400 text-sm">Current Bet</span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {formatCurrency(userData.total_bet || 0)} {userData.currency}
                      </p>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <FaTrophy className="text-yellow-400" />
                        <span className="text-gray-400 text-sm">Required Bet</span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        {formatCurrency(turnoverData.requiredBet)} {userData.currency}
                      </p>
                    </div>
                  </div>

                  {/* Completion Message */}
                  {turnoverData.isCompleted && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-center space-x-3">
                      <FaCheckCircle className="text-green-400 text-xl" />
                      <div>
                        <p className="text-green-400 font-medium">Turnover Completed!</p>
                        <p className="text-green-300 text-sm">
                          You have successfully completed the turnover requirement.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Message */}
                  {!turnoverData.isCompleted && turnoverData.progress > 0 && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        You need to bet {formatCurrency(turnoverData.requiredBet - turnoverData.currentBet)} {userData.currency} more to complete turnover.
                      </p>
                    </div>
                  )}

                  {/* Zero Progress Message */}
                  {!turnoverData.isCompleted && turnoverData.progress === 0 && (
                    <div className="mt-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                      <p className="text-gray-400 text-sm">
                        Start betting to make progress on your turnover requirement.
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <FaTrophy className="text-yellow-400" />
                    <span>About Turnover</span>
                  </h4>
                  <div className="text-gray-400 text-sm space-y-2">
                    <p>• Turnover requirement: 3x your total deposit amount</p>
                    <p>• Only completed bets count towards turnover</p>
                    <p>• Progress updates in real-time</p>
                    <p>• Once completed, you'll be eligible for withdrawals</p>
                  </div>
                </div>

                {/* No Active/Completed Turnovers Message */}
                {(activeTab === "active" && !turnoverData.isCompleted) || 
                 (activeTab === "completed" && turnoverData.isCompleted) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FaFolderOpen className="text-5xl text-green-500 mb-4 opacity-50" />
                    <p className="text-gray-400">
                      {activeTab === "active" 
                        ? "No active turnover requirements" 
                        : "No completed turnover history"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FaFolderOpen className="text-5xl text-gray-500 mb-4" />
                    <p className="text-gray-400">
                      {activeTab === "active" 
                        ? "All turnover requirements completed" 
                        : "No turnover requirements completed yet"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Turnover;