import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "../../../assets/logo.png";

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
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
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

const CategoryContent = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gamesPage, setGamesPage] = useState(1);
  const [hasMoreGames, setHasMoreGames] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (exclusiveGames.length > 0) {
      // Initially show 20 games
      const initialGames = exclusiveGames.slice(0, 20);
      setDisplayedGames(initialGames);
      setHasMoreGames(exclusiveGames.length > 20);
    } else {
      setDisplayedGames([]);
      setHasMoreGames(false);
    }
  }, [exclusiveGames]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
        if (response.data.data.length > 0) {
          const firstCategory = response.data.data[0];
          setActiveCategory(firstCategory);
          if (firstCategory.name.toLowerCase() === "exclusive") {
            fetchExclusiveGames(firstCategory.name);
          } else {
            fetchProviders(firstCategory.name);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async (categoryName) => {
    try {
      const response = await axios.get(
        `${base_url}/api/providers/${categoryName}`
      );
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]); // Clear exclusive games when showing providers
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchExclusiveGames = async (categoryName) => {
    try {
      const response = await axios.get(
        `${base_url}/api/games/category/${categoryName.toLowerCase()}?limit=50`
      );
      if (response.data.success) {
        setExclusiveGames(response.data.data);
        setProviders([]); // Clear providers when showing exclusive games
        setGamesPage(1);
      }
    } catch (error) {
      console.error("Error fetching exclusive games:", error);
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (category.name.toLowerCase() === "exclusive") {
      fetchExclusiveGames(category.name);
    } else {
      fetchProviders(category.name);
    }
  };

  const handleProviderClick = (provider) => {
    if (activeCategory) {
      navigate(
        `/games?category=${activeCategory.name.toLowerCase()}&provider=${provider.name.toLowerCase()}`
      );
    }
  };

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

  const handleShowMore = () => {
    const nextPage = gamesPage + 1;
    const nextGames = exclusiveGames.slice(0, 20 * nextPage);
    setDisplayedGames(nextGames);
    setGamesPage(nextPage);
    setHasMoreGames(exclusiveGames.length > nextGames.length);
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLoginPopup && !event.target.closest(".popup-content")) {
        setShowLoginPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginPopup]);

  // Render provider grid based on the number of providers
  const renderProviderGrid = () => {
    if (providers.length === 0 && exclusiveGames.length === 0) {
      return (
        <div className="p-4 text-center text-[13px] text-white">
          No Provider found for this category.
        </div>
      );
    }

    if (activeCategory?.name.toLowerCase() === "exclusive") {
      // Render exclusive games in a responsive grid
      return (
        <div className="px-2 md:p-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {displayedGames.map((game) => (
              <div
                key={game._id}
                className="flex flex-col items-center rounded-[3px] overflow-hidden transition-all cursor-pointer relative group"
                onClick={() => handleGameClick(game)}
              >
                <div className="w-full aspect-[3/4] relative overflow-hidden">
                  <img
                    src={`${base_url}/${
                      game.landscapeImage || game.portraitImage
                    }`}
                    alt={game.name}
                    className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Play Button - Always visible on mobile, on hover for desktop */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.2)] bg-opacity-40 transition-opacity duration-300 ${
                      isMobile
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <div className="bg-theme_color p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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

          {hasMoreGames && (
            <div className="flex justify-center mt-4">
              <button
                className="px-6 py-2 bg-theme_color cursor-pointer text-white text-sm rounded"
                onClick={handleShowMore}
              >
                More
              </button>
            </div>
          )}
        </div>
      );
    }

    // Render providers grid for non-exclusive categories
    return (
      <div className="px-2 md:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className="flex justify-start items-center gap-[10px] px-4 py-2 rounded-[3px] bg-[#222424] hover:bg-[#333333] transition-all cursor-pointer text-white"
              onClick={() => handleProviderClick(provider)}
            >
              <img
                src={`${base_url}/${provider.image}`}
                alt={provider.name}
                className="w-[30px]"
              />
              <span className="text-sm text-gray-400">{provider.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          /* Force consistent image size and aspect ratio */
          .game-image-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 133.33%; /* 3:4 aspect ratio */
            overflow: hidden;
          }
          
          .game-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        `}
      </style>

      {/* Mobile slider for categories using Embla Carousel */}
      <div className="block lg:hidden px-2 py-4 md:p-4 pt-[40px] relative hidescrollbar">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex gap-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`embla__slide flex-shrink-0 w-[calc(25.333%-0.5rem)] min-w-0 flex flex-col relative items-center justify-center p-3 rounded-[5px] transition-all group cursor-pointer ${
                  activeCategory?._id === category._id
                    ? "bg-theme_color text-white"
                    : "bg-box_bg hover:bg-[#333333]"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <img
                  src={`${base_url}/${category.image}`}
                  alt={category.name}
                  className="w-[45px] absolute top-[-30%] rounded-full transition-transform duration-300 ease-in-out group-hover:rotate-[360deg]"
                />
                <span
                  className={`text-[13px] md:text-sm mt-4 font-[500] ${
                    activeCategory?._id === category._id
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop grid for categories */}
      <div className="hidden lg:grid grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4 p-4 pt-[40px]">
        {categories.map((category) => (
          <div
            key={category._id}
            className={`flex flex-col relative items-center justify-center p-3 rounded-[5px] transition-all group cursor-pointer ${
              activeCategory?._id === category._id
                ? "bg-theme_color text-white"
                : "bg-box_bg hover:bg-[#333333]"
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            <img
              src={`${base_url}/${category.image}`}
              alt={category.name}
              className="w-[45px] absolute top-[-30%] rounded-full transition-transform duration-300 ease-in-out group-hover:rotate-[360deg]"
            />
            <span
              className={`text-sm mt-4 font-[500] ${
                activeCategory?._id === category._id
                  ? "text-white"
                  : "text-gray-400"
              }`}
            >
              {category.name}
            </span>
          </div>
        ))}
      </div>

      {/* Content area (providers or exclusive games) */}
      {renderProviderGrid()}

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div className="popup-content bg-gradient-to-b cursor-pointer from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-6 max-w-md w-full relative">
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
              <img src={logo} className="w-[100px]" alt="" />
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
                className="bg-theme_color text-center hover:bg-theme_color/90 text-[14px] text-white font-medium py-3 px-4 transition-colors"
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
                src={logo}
                alt="Loading..."
                className="w-20 h-20 object-contain animate-pulse"
              />
              {/* Spinning ring around logo */}
              <div className="absolute -inset-4 border-4 border-theme_color border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main export component that wraps CategoryContent with AuthProvider
const Category = () => {
  return (
    <AuthProvider>
      <CategoryContent />
    </AuthProvider>
  );
};

export default Category;
