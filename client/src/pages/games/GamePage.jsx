import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GamePage = () => {
  const { gameuuid } = useParams();
  const [gameLink, setGameLink] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // iframe loading state
  const [loadingLINK, setLoadingLINK] = useState(true); // fetch link loading state
  const [isGameLinkFetched, setIsGameLinkFetched] = useState(false);
  const videoRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch user data from localStorage and API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
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
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Fetch game link when userData and gameuuid are available
  useEffect(() => {
    const fetchGameLink = async () => {
      if (!gameuuid || !userData) return;
      setError(null);
      setLoadingLINK(true);
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
        setLoadingLINK(false);
        if (link) {
          setGameLink(link);
        } else {
          throw new Error("Game link not found in response");
        }
      } catch (error) {
        console.error("Error fetching game link:", error);
        setError(error.message);
        setLoadingLINK(false);
      } finally {
        setIsGameLinkFetched(true);
      }
    };
    if (gameuuid && userData) {
      fetchGameLink();
    }
  }, [gameuuid, userData, API_BASE_URL]);

  // Check iframe loading state
  useEffect(() => {
    if (!videoRef.current || !gameLink) return;

    console.log("GAME: start");
    setLoading(true);

    const handleIframeLoad = () => {
      console.log("GAME: end (iframe loaded)");
      setLoading(false);
    };

    videoRef.current.addEventListener("load", handleIframeLoad);

    // Fallback timer for cross-origin cases
    const fallbackTimer = setTimeout(() => {
      console.log("GAME: end (fallback timer)");
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      // videoRef.current.removeEventListener("load", handleIframeLoad);
    };
  }, [gameLink]);

  // Log loading states for debugging
  useEffect(() => {
    console.log("loading:", loading, "loadingLINK:", loadingLINK);
  }, [loading, loadingLINK]);

  // Show loading state while fetching user data or game link
  if (loading || loadingLINK) {
    return (
      <div className="loader-container fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50">
        <div className="flex flex-col items-center justify-center">
          <div className="loader relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-bounce">
            Loading Game
          </h2>
          <p className="text-lg font-semibold text-blue-600">
            www.oracleapi.net
          </p>
          <p className="mt-2 text-lg font-semibold text-blue-600">
            গেম লোড হচ্ছে অপেক্ষা করুন...
          </p>
        </div>
        <style>
          {`
          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }
          .animate-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          .animate-bounce {
            animation: bounce 2s ease-in-out infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0.9; }
            100% { transform: scale(1); opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
        </style>
      </div>
    );
  }

  // Show error if fetching fails
  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">একটি ত্রুটি ঘটেছে!</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show "Game link not found" warning
  if (!gameLink && isGameLinkFetched) {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-[100vh]">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md shadow-md">
          <p className="font-semibold">গেম লিঙ্ক পাওয়া যায়নি!</p>
          <p className="text-sm">দয়া করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100vh] bg-white overflow-hidden">
      {/* Iframe */}
      <iframe
        ref={videoRef}
        className="w-full h-full fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-100 z-50"
        src={gameLink}
        frameBorder="0"
        title={gameuuid}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default GamePage;
