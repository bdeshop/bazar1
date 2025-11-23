import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Header } from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import logo from "../../assets/logo.png";
const GamePage = () => {
  const { gameuuid } = useParams();
  const [gameLink, setGameLink] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minLoaderTimePassed, setMinLoaderTimePassed] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIframeLoader, setShowIframeLoader] = useState(true);
  const videoRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Minimum loader time (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoaderTimePassed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Iframe loader timer (4 seconds)
  useEffect(() => {
    let timer;
    if (iframeLoaded) {
      timer = setTimeout(() => {
        setShowIframeLoader(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [iframeLoaded]);

  // Fetch user data from localStorage and API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found");
          setIsLoading(false);
          return;
        }

        // Fetch user information
        const userResponse = await axios.get(
          `${API_BASE_URL}/api/user/all-information/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (userResponse.data.success) {
          setUserData(userResponse.data.data);
        } else {
          setError(userResponse.data.message);
          setIsLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching data:", err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Fetch game link when userData and gameuuid are available
  useEffect(() => {
    const fetchGameLink = async () => {
      if (!gameuuid || !userData) return;
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.post(
          `${API_BASE_URL}/api/user/getGameLink`,
          {
            gameID: gameuuid,
            money: parseInt(userData?.balance || 0, 10),
            username: user?.username,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const link = response.data?.joyhobeResponse;
        if (link) {
          setGameLink(link);
        } else {
          throw new Error("Game link not found in response");
        }
      } catch (error) {
        console.error("Error fetching game link:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (gameuuid && userData) {
      fetchGameLink();
    }
  }, [gameuuid, userData, API_BASE_URL]);

  // Professional Unified Loader Component
  const ProfessionalLoader = ({ message = "গেম লোড হচ্ছে", subMessage = "অনুগ্রহ করে একটু অপেক্ষা করুন..." }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-30">
      {/* Main loader container */}
      <div className="relative flex flex-col items-center justify-center">
        
    

        {/* Loading text */}
        <div className="text-center mt-8 space-y-2">
          <img className="w-[150px]" src={logo} alt="" />
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-gray-700 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );

  // Determine what to show in the iframe box
  const renderIframeContent = () => {
    // Show loader if still loading or minimum time hasn't passed
    if (isLoading || !minLoaderTimePassed) {
      return <ProfessionalLoader 
        message="গেম লোড হচ্ছে" 
        subMessage="অনুগ্রহ করে একটু অপেক্ষা করুন..." 
      />;
    }

    // Show error state
    if (error) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-10">
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-8 py-6 rounded-2xl shadow-2xl max-w-md mx-4 backdrop-blur-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-bold text-xl text-center text-white">একটি সমস্যা হয়েছে</p>
              <p className="text-red-200 text-center mt-2 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }

    // Show "Game link not found" warning
    if (!gameLink) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-10">
          <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 px-8 py-6 rounded-2xl shadow-2xl max-w-md mx-4 backdrop-blur-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="font-bold text-xl text-center text-white">গেম লিঙ্ক পাওয়া যায়নি!</p>
              <p className="text-yellow-200 text-center mt-2 text-sm">দয়া করে পরে আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              রিফ্রেশ করুন
            </button>
          </div>
        </div>
      );
    }

    // Show iframe when everything is ready
    return (
      <div className="w-full h-full relative">
        {/* Iframe Loader - shows for 4 seconds after iframe starts loading */}
        {showIframeLoader && (
          <ProfessionalLoader 
            message="গেম শুরু হচ্ছে" 
            subMessage="গেম প্রস্তুত করা হচ্ছে, কিছুক্ষণ অপেক্ষা করুন..." 
          />
        )}
        
        {/* Game Iframe */}
        <iframe
          ref={videoRef}
          className="w-full h-full"
          src={gameLink}
          frameBorder="0"
          title={gameuuid}
          allowFullScreen
          onLoad={() => {
            setIframeLoaded(true);
            console.log("Game loaded successfully");
          }}
          style={{
            opacity: showIframeLoader ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
        />
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="md:block hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      
      {/* Main Content */}
      <div className="flex h-[100vh] md:h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Game Content */}
        <div className={`flex-1 overflow-auto md:p-[60px] lg:p-[100px] transition-all duration-300 relative`}>
          {/* Iframe Container */}
          <div className="w-full h-full relative md:border-[1px] border-gray-700 rounded-lg overflow-hidden bg-black">
            {renderIframeContent()}
          </div>
        </div>
      </div>

      {/* Add custom animation for progress bar */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GamePage;