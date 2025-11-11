import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Header } from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Footer from "../../components/footer/Footer";
import logo from "../../assets/logo.png";
import {
  IoSearchSharp,
  IoChevronDown,
  IoChevronUp,
  IoClose,
} from "react-icons/io5";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../App";

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("casino");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [visibleGamesCount, setVisibleGamesCount] = useState(16);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const { user } = useAuth();

  const searchRef = useRef(null);
  const categoryRef = useRef(null);
  const filterSidebarRef = useRef(null);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get query parameters on component mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const providerParam = searchParams.get("provider");

    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    }

    if (providerParam) {
      setSelectedProviders([providerParam.toLowerCase()]);
    }
  }, [searchParams]);

  // Fetch categories and games on component mount
  useEffect(() => {
    fetchCategories();
    fetchAllGames();
  }, []);

  // Update URL query parameters when filters change
  useEffect(() => {
    const params = {};

    if (selectedCategory !== "all") {
      params.category = selectedCategory;
    }

    if (selectedProviders.length === 1 && !selectedProviders.includes("all")) {
      params.provider = selectedProviders[0];
    }

    setSearchParams(params);
  }, [selectedCategory, selectedProviders, setSearchParams]);

  // Handle click outside to close dropdowns and sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (
        filterSidebarRef.current &&
        !filterSidebarRef.current.contains(event.target)
      ) {
        setShowFilterSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/categories`);
      if (response.data.success) {
        const categoriesData = response.data.data;
        setCategories([
          {
            name: "All Categories",
            value: "all",
            icon: "fas fa-list",
            image: null,
          },
          ...categoriesData.map((cat) => ({
            name: cat.name,
            value: cat.name.toLowerCase(),
            icon: getCategoryIcon(cat.name),
            image: cat.image,
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch providers based on category
  const fetchProviders = async (categoryName) => {
    try {
      const response = await axios.get(
        `${base_url}/api/providers/${categoryName}`
      );
      if (response.data) {
        const providersData = response.data.data;
        setProviders([
          { name: "All Providers", value: "all", icon: "fas fa-grid" },
          ...providersData.map((provider) => ({
            name: provider.name,
            value: provider.name.toLowerCase(),
            icon: getProviderIcon(provider.name),
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  // Fetch all games
  const fetchAllGames = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/all-games`);
      if (response.data.success) {
        let gamesData = response.data.data;

        if (gamesData.length > 0) {
          const gameApiIDs = gamesData.map((game) => game.gameApiID);

          try {
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

            if (externalApiResponse.data) {
              console.log("External API response:", externalApiResponse.data);

              const externalGames = externalApiResponse.data.data;

              console.log("Fetched external games:", externalGames);

              gamesData = gamesData.map((localGame) => {
                const externalGame = externalGames.find((eg) => {
                  return eg._id === localGame.gameApiID;
                });

                console.log("Matching external game:", externalGame);

                if (externalGame) {
                  // category বাদ দিয়ে বাকিগুলো merge করা
                  const { category, provider, ...externalGameWithoutCategory } =
                    externalGame;

                  console.log(
                    `Merging external game data for game API ID ${localGame.gameApiID} , ${externalGame._id}`
                  );

                  return {
                    ...localGame,
                    ...externalGameWithoutCategory,
                    game_uuid: externalGame.game_uuid,
                  };
                } else {
                  console.log(
                    `No external game data found for game API ID ${localGame.gameApiID}`
                  );
                }

                return localGame;
              });
            }
          } catch (apiError) {
            console.error(
              "Error fetching from external games API, using local data as fallback:",
              apiError
            );
          }
        }

        setGames(gamesData);

        // Apply filters from query parameters
        let filtered = gamesData;

        // Filter by category from query params
        const categoryParam = searchParams.get("category");
        if (categoryParam && categoryParam !== "all") {
          filtered = filtered.filter(
            (game) =>
              game?.category &&
              game.category.toLowerCase() === categoryParam?.toLowerCase()
          );
          setSelectedCategory(categoryParam.toLowerCase());
        } else {
          // Default to casino games if no category param
          filtered = filtered.filter(
            (game) => game?.category && game.category.toLowerCase() === "casino"
          );
        }

        // Filter by provider from query params
        const providerParam = searchParams.get("provider");
        if (providerParam && providerParam !== "all") {
          filtered = filtered.filter(
            (game) =>
              game?.provider &&
              game.provider.toLowerCase() === providerParam.toLowerCase()
          );
          setSelectedProviders([providerParam.toLowerCase()]);
        }

        setFilteredGames(filtered);

        // Fetch providers for the selected category
        const categoryToFetch = categoryParam || "casino";
        fetchProviders(categoryToFetch);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for category
  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case "live":
      case "live casino":
        return "fas fa-video";
      case "table":
      case "table games":
        return "fas fa-chess-board";
      case "slots":
        return "fas fa-sliders-h";
      case "casino":
        return "fas fa-dice";
      case "crash":
        return "fas fa-chart-line";
      default:
        return "fas fa-list";
    }
  };

  // Get icon for provider
  const getProviderIcon = (providerName) => {
    switch (providerName.toLowerCase()) {
      case "evolution":
        return "fas fa-play-circle";
      case "pragmatic play":
        return "fas fa-dice";
      case "playtech":
        return "fas fa-gamepad";
      case "netent":
        return "fas fa-coins";
      case "microgaming":
        return "fas fa-crown";
      default:
        return "fas fa-puzzle-piece";
    }
  };

  // Toggle provider selection
  const toggleProvider = (value) => {
    setSelectedProviders((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  // Handle category change
  const handleCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowCategoryDropdown(false);

    // Fetch providers for the selected category
    if (categoryValue !== "all") {
      const category = categories.find((c) => c.value === categoryValue);
      if (category) {
        fetchProviders(category.name);
      }
    } else {
      setProviders([
        { name: "All Providers", value: "all", icon: "fas fa-grid" },
      ]);
    }
    setSelectedProviders([]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedProviders([]);
    setSelectedCategory("casino");
    setShowFilterSidebar(false);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  // Filter games based on search and filters
  useEffect(() => {
    let filtered = games;

    if (searchTerm) {
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProviders.length > 0 && !selectedProviders.includes("all")) {
      filtered = filtered.filter((game) =>
        selectedProviders.includes(game.provider.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (game) => game?.category?.toLowerCase() === selectedCategory
      );
    }

    setFilteredGames(filtered);
    setVisibleGamesCount(16);
  }, [searchTerm, selectedProviders, selectedCategory, games]);

  const visibleGames = filteredGames.slice(0, visibleGamesCount);
  const hasMoreGames = visibleGamesCount < filteredGames.length;
  const loadingProgress = Math.min(
    100,
    (visibleGamesCount / filteredGames.length) * 100
  );

  const loadMoreGames = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleGamesCount((prevCount) => prevCount + 16);
      setIsLoadingMore(false);
    }, 800);
  };

  const gameNames = [...new Set(games.map((game) => game.name))];
  const filteredSuggestions = gameNames
    .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "All Categories";
    const category = categories.find((c) => c.value === selectedCategory);
    return category ? category.name : "All Categories";
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          <div className="mx-auto w-full max-w-screen-xl py-4 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                Casino Games
              </h1>
              <div className="text-xs sm:text-sm text-gray-400">
                Showing{" "}
                <span className="text-yellow-400 font-medium">
                  {visibleGames.length}
                </span>{" "}
                of{" "}
                <span className="text-yellow-400 font-medium">
                  {filteredGames.length}
                </span>{" "}
                games
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-between items-center gap-2 sm:gap-4 w-full mb-4 sm:mb-6">
              <div className="w-full sm:w-auto relative" ref={categoryRef}>
                <button
                  className="flex w-full sm:w-auto items-center justify-start cursor-pointer text-white pr-4 py-2 sm:py-3 rounded-lg min-w-[180px] text-xs sm:text-sm transition-colors"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <div className="flex items-center">
                    {categories.find((c) => c.value === selectedCategory)
                      ?.image && (
                      <img
                        src={`${base_url}/${
                          categories.find((c) => c.value === selectedCategory)
                            .image
                        }`}
                        alt=""
                        className="mr-2 w-4 h-4"
                      />
                    )}
                    <i
                      className={`${
                        categories.find((c) => c.value === selectedCategory)
                          ?.icon || "fas fa-list"
                      } mr-2 text-yellow-500`}
                    ></i>
                    <span>{getSelectedCategoryName()}</span>
                  </div>
                  {showCategoryDropdown ? (
                    <IoChevronUp className="text-sm ml-2" />
                  ) : (
                    <IoChevronDown className="text-sm ml-2" />
                  )}
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 text-xs sm:text-sm right-0 bg-[#222] border border-[#333] rounded-lg shadow-lg z-20 mt-1 overflow-hidden">
                    {categories.map((category) => (
                      <div
                        key={category.value}
                        className={`px-4 py-3 cursor-pointer flex items-center transition-colors ${
                          selectedCategory === category.value
                            ? " bg-opacity-10 text-theme_color"
                            : "hover:bg-[#2a2a2a]"
                        }`}
                        onClick={() => handleCategoryChange(category.value)}
                      >
                        {category.image && (
                          <img
                            src={`${base_url}/${category.image}`}
                            alt=""
                            className="mr-2 w-4 h-4"
                          />
                        )}
                        <i
                          className={`${category.icon} mr-2 ${
                            selectedCategory === category.value
                              ? "text-theme_color"
                              : "text-gray-400"
                          }`}
                        ></i>
                        {category.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <div className="relative">
                  <button
                    className="flex items-center justify-center cursor-pointer text-white px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                    onClick={() => setShowFilterSidebar(true)}
                  >
                    <RiArrowLeftRightLine className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex md:flex-row flex-col gap-4 mb-8 w-full">
              <div className="relative w-full" ref={searchRef}>
                <div className="relative">
                  <IoSearchSharp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search games..."
                    className="w-full pl-12 pr-4 py-3 bg-[#222] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-theme_color focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                </div>
                {showSuggestions &&
                  searchTerm &&
                  filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-b-lg shadow-xl z-20 mt-2 overflow-hidden transform transition-all duration-200 ease-in-out">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors duration-150 flex items-center text-sm text-gray-200"
                          onClick={() => {
                            setSearchTerm(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          <i className="fas fa-search text-gray-400 mr-3 text-xs"></i>
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {isLoading ? (
              <div className="w-full p-[20px] flex justify-center items-center">
                <div className="relative w-24 h-24 flex justify-center items-center">
                  <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                  <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                    <img className="w-16" src={logo} alt="Loading..." />
                  </div>
                </div>
              </div>
            ) : visibleGames.length > 0 ? (
              <>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                  {visibleGames.map((game) => (
                    <div
                      key={game._id}
                      className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-[3px] overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-yellow-500/10"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={`${base_url}${game.portraitImage}`}
                          alt={game.name}
                          className="w-full h-[150px] xs:h-[180px] sm:h-[200px] md:h-[220px] object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center md:bg-[rgba(0,0,0,0.2)] bg-opacity-40 transition-opacity duration-300 ${
                            isMobile
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <div
                            className="bg-theme_color p-3 rounded-full"
                            onClick={() => {
                              if (!user) {
                                navigate("/login");
                                return;
                              }

                              if (game.game_uuid) {
                                console.log(
                                  "Opening game with UUID:",
                                  game.game_uuid
                                );

                                // Navigate to game route
                                navigate(`/game/${game.game_uuid}`);
                              }
                            }}
                          >
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
                        {game.featured && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                            NEW
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full">
                          <i
                            className={`fas fa-heart ${
                              game.isFavorite ? "text-red-500" : "text-white"
                            }`}
                          ></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMoreGames && (
                  <div className="mt-8 flex flex-col items-center">
                    <div className="w-full max-w-sm bg-[#222] rounded-full h-2.5 mb-4 overflow-hidden">
                      <div
                        className="bg-theme_color h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={loadMoreGames}
                      disabled={isLoadingMore}
                      className="px-6 py-3 bg-theme_color text-[12px] sm:text-[14px] cursor-pointer text-white font-medium rounded-lg hover:bg-theme_color/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoadingMore ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus-circle mr-2"></i>
                          Load More Games
                        </>
                      )}
                    </button>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">
                      Showing {visibleGames.length} of {filteredGames.length}{" "}
                      games
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-search text-4xl text-gray-500 mb-4"></i>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-2">
                  No games found
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-theme_color text-white rounded-lg text-sm"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>

      {showFilterSidebar && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40"
          onClick={() => setShowFilterSidebar(false)}
        />
      )}
      {showFilterSidebar && (
        <div
          ref={filterSidebarRef}
          className={`fixed pt-6 top-0 right-0 h-full ${
            isMobile ? "left-0 w-full" : "w-80"
          } bg-[#0f0f0f] z-50 shadow-lg overflow-y-auto flex flex-col`}
        >
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[#333]">
            <h2 className="text-lg font-bold text-white">Filter</h2>
            {isMobile && (
              <button
                onClick={() => setShowFilterSidebar(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Providers
              </label>
              <div className="mt-2 pl-4 max-h-48 overflow-y-auto space-y-3">
                {providers.map((provider) => (
                  <label
                    key={provider.value}
                    className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(provider.value)}
                      onChange={() => toggleProvider(provider.value)}
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <i
                        className={`${provider.icon} mr-2 text-yellow-500 flex-shrink-0`}
                      ></i>
                      <span className="select-none text-gray-300">
                        {provider.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-[#0f0f0f] p-4 border-t border-[#333] flex justify-between space-x-3">
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#222] border-[1px] text-nowrap border-gray-800 text-white rounded-[4px] text-[15px] cursor-pointer transition-all duration-200 flex-1 hover:bg-[#333] hover:border-gray-600"
            >
              Clear all
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-3 bg-theme_color text-nowrap text-white rounded-[4px] transition-all duration-200 text-[15px] cursor-pointer flex-1 hover:bg-theme_color/90 shadow-lg hover:shadow-theme_color/20"
            >
              Apply filters
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
};

export default Games;
