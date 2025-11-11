import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../../assets/logo.png";
import axios from "axios";
// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    // Check if user is logged in on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Validate token with backend
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        // Token is invalid, remove it
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    checkAuthStatus,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const FeaturedContent = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dynamicLogo, setDynamicLogo] = useState(logo);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Ref to the slider container for scrolling
  const sliderRef = useRef(null);
  const popupRef = useRef(null);

  // Fetch branding data for dynamic logo
  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/branding`);
      if (response.data.success && response.data.data && response.data.data.logo) {
        const logoUrl = response.data.data.logo.startsWith('http') 
          ? response.data.data.logo 
          : `${base_url}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
      setDynamicLogo(logo);
    }
  };

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch featured games from API
  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/games/featured/featured`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          console.log(data)
          setFeaturedGames(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch featured games");
        }
      } catch (err) {
        console.error("Error fetching featured games:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
    fetchBrandingData();
  }, [base_url]);

  // Function to scroll the slider to the left
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -200, // Adjust scroll amount as needed
        behavior: "smooth",
      });
    }
  };

  // Function to scroll the slider to the right
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 200, // Adjust scroll amount as needed
        behavior: "smooth",
      });
    }
  };

  // Automatically slide the images
  useEffect(() => {
    if (featuredGames.length === 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    let slideInterval;
    const startSliding = () => {
      slideInterval = setInterval(() => {
        // Check if we are at the end of the scrollable area
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
          // If at the end, jump back to the start without a smooth transition
          slider.scrollLeft = 0;
        } else {
          // Otherwise, scroll to the next image
          slider.scrollBy({
            left: 200, // Must match the scrollRight value
            behavior: "smooth",
          });
        }
      }, 3000); // Change image every 3 seconds
    };

    // Pause the sliding on mouse hover
    const pauseSliding = () => {
      clearInterval(slideInterval);
    };

    slider.addEventListener("mouseenter", pauseSliding);
    slider.addEventListener("mouseleave", startSliding);

    startSliding();

    return () => {
      // Clean up event listeners and interval on component unmount
      clearInterval(slideInterval);
      slider.removeEventListener("mouseenter", pauseSliding);
      slider.removeEventListener("mouseleave", startSliding);
    };
  }, [featuredGames]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLoginPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle game click
  const handleGameClick = (game) => {
    setSelectedGame(game);

    // Check if user is logged in
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    // If user is logged in, try to open the game
    handleOpenGame(game);
  };

  // Handle opening the game
  const handleOpenGame = async (game) => {
    console.log("Attempting to open game:", game);

    // Check if user is logged in
    if (!user) {
      toast.error("Please login to play games");
      setShowLoginPopup(true);
      return;
    }

    try {
      setGameLoading(true);

      const dataaa = game.gameId;

      console.log("Game ID:", dataaa);

      const response = await fetch(`${base_url}/api/games/${game.gameId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch game with ID ${game.gameId}`);
      }

      const gameData = await response.json();
      if (!gameData.success) {
        throw new Error(`Failed to fetch game with ID ${game.gameId}`);
      }

      console.log("Game data:", gameData?.data?.gameApiID);

      // Step 1: Fetch game data from external API
      const gameApiIDs = [gameData?.data?.gameApiID]; // Assuming game.gameId is the ID needed; adjust if multiple IDs
      const externalApiResponse = await axios.post(
        "https://apigames.oracleapi.net/api/games/by-ids",
        { ids: gameApiIDs },
        {
          headers: {
            "x-api-key":
              "f7709c7bd13372f79d71906ee3071d26fdb4338987eb731d8182dd743e0bb5ce",
          },
        }
      );

      // Step 2: Check if external API response is valid
      if (!externalApiResponse.data || externalApiResponse.data.length === 0) {
        toast.error("Failed to fetch game data from external API");
        return;
      }

      // Assuming externalApiResponse.data contains relevant game data
      const externalGameData = externalApiResponse?.data?.data[0]; // Adjust based on actual response structure
      console.log("External API game data:", externalGameData?.game_uuid);

      if (!externalGameData?.game_uuid) {
        toast.error("Failed to fetch game data from external API");
        return;
      }

      navigate(`/game/${externalGameData.game_uuid}`);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error connecting to game server");
    } finally {
      setGameLoading(false);
    }
  };

  // Handle login from popup
  const handleLoginFromPopup = () => {
    setShowLoginPopup(false);
    navigate("/login");
  };

  // Handle register from popup
  const handleRegisterFromPopup = () => {
    setShowLoginPopup(false);
    navigate("/register");
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Featured Games
          </h2>
        </div>
        <div className="flex overflow-x-auto py-2 scrollbar-hide">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-32 h-40 md:w-[200px] md:h-[250px] rounded-[3px] flex flex-col items-center justify-center p-2"
            >
              <div className="w-full h-full bg-gray-700 animate-pulse rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#1a1a1a] p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Featured Games
          </h2>
        </div>
        <div className="text-center py-8 text-red-400">
          Error loading featured games: {error}
        </div>
      </div>
    );
  }

  // No games available
  if (featuredGames.length === 0) {
    return (
      <div className="bg-[#1a1a1a] p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Featured Games
          </h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          No featured games available
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          
          /* Force consistent image size and aspect ratio */
          .featured-image-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 125%; /* 4:5 aspect ratio (200px width, 250px height) */
            overflow: hidden;
          }
          
          .featured-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius:5px;
          }
        `}
      </style>
      <div className="bg-[#1a1a1a] px-2 pt-6 md:p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Featured Games
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll left"
            >
              {/* Using inline SVG for the left arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll right"
            >
              {/* Using inline SVG for the right arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory"
        >
          {featuredGames.map((game, index) => (
            <div
              key={game._id || index}
              className="flex-shrink-0 w-40 md:w-[200px] flex flex-col items-center justify-center p-1 snap-center transform transition-transform duration-200 hover:scale-105 cursor-pointer relative group"
              onClick={() => handleGameClick(game)}
            >
              <div className="featured-image-container">
                <img
                  src={`${base_url}/${
                  game.portraitImage
                  }`}
                  alt={game.name}
                  className="featured-image"
                />

                {/* Play Button - Always visible on mobile, on hover for desktop */}
                <div
                  className={`absolute inset-0 flex items-center justify-center md:bg-[rgba(0,0,0,0.2)] bg-opacity-40 transition-opacity duration-300 ${
                    isMobile
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="bg-theme_color p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-play"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div
            ref={popupRef}
            className="bg-gradient-to-b cursor-pointer from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-6 max-w-md w-full relative"
          >
            {/* Close button */}
            <button
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                className="w-[100px]" 
                src={dynamicLogo} 
                alt=""
              />
            </div>

            {/* Description */}
            <p className="text-gray-300 text-xs md:text-[15px] text-center mb-6">
              Please log in to play the game. If you don't have an account, sign
              up for free!
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRegisterFromPopup}
                className="bg-theme_color text-center hover:bg-theme_color/90 text-[14px] text-white font-medium py-3 px-4  transition-colors"
              >
                Sign up
              </button>

              <button
                onClick={handleLoginFromPopup}
                className="bg-[#333] text-center hover:bg-[#444] text-[14px] text-white font-medium py-3 px-4 transition-colors"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Loading Overlay */}
      {gameLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center">
            {/* Animated logo with pulsing effect */}
            <div className="relative mb-8">
              <img
                src={dynamicLogo}
                alt="Loading..."
                className="w-20 h-20 object-contain animate-pulse"
                onError={(e) => {
                  e.target.src = logo;
                }}
              />
              {/* Spinning ring around logo */}
              <div className="absolute -inset-4 border-4 border-theme_color border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Loading text with animation
      <p className="text-white text-xl font-semibold mb-6 flex items-center">
        Loading game
        <span className="animate-bounce delay-100">.</span>
        <span className="animate-bounce delay-200">.</span>
        <span className="animate-bounce delay-300">.</span>
      </p> */}

            {/* Animated progress bar */}
            {/* <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-theme_color to-yellow-500 animate-[progressBar_2s_ease-in-out_infinite]"></div>
      </div>
       */}
            {/* Optional tip or message */}
            {/* <p className="text-gray-400 text-sm mt-6">Preparing your gaming experience...</p> */}
          </div>
        </div>
      )}
    </>
  );
};

// Main export component that wraps FeaturedContent with AuthProvider
const Featured = () => {
  return (
    <AuthProvider>
      <FeaturedContent />
    </AuthProvider>
  );
};

export default Featured;