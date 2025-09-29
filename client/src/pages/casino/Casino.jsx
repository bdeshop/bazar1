import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import { Header } from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import Footer from '../../components/footer/Footer';
import { NavLink, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import logo from "../../assets/logo.png";
import { IoSearchSharp, IoChevronDown, IoChevronUp, IoClose } from "react-icons/io5";
import { MdFilterList, MdSort } from 'react-icons/md';
import { RiArrowLeftRightLine } from "react-icons/ri";

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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    checkAuthStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Main Casino Component
const CasinoContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [selectedGameTypes, setSelectedGameTypes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState(['all']);
  const [selectedSpecialFeatures, setSelectedSpecialFeatures] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('casino');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  const [visibleGamesCount, setVisibleGamesCount] = useState(16);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allGames, setAllGames] = useState([]);
  const [games, setGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showProvidersDropdown, setShowProvidersDropdown] = useState(true);
  const [showGameTypeDropdown, setShowGameTypeDropdown] = useState(true);
  const [showThemeDropdown, setShowThemeDropdown] = useState(true);
  const [showSpecialFeatureDropdown, setShowSpecialFeatureDropdown] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const searchRef = useRef(null);
  const categoryRef = useRef(null);
  const popupRef = useRef(null);
  const filterSidebarRef = useRef(null);
  const sortRef = useRef(null);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAllGames();
  }, []);

  useEffect(() => {
    if (allGames.length > 0 && categories.length > 0) {
      handleCategoryFilter();
    }
  }, [selectedCategory, allGames, categories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowLoginPopup(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (filterSidebarRef.current && !filterSidebarRef.current.contains(event.target)) {
        setShowFilterSidebar(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/categories`);
      if (response.data.success) {
        const categoriesData = response.data.data.map(cat => ({
          name: cat.name,
          value: cat.name.toLowerCase(),
          icon: getCategoryIcon(cat.name),
          image: cat.image
        }));
        setCategories([
          { name: "All Categories", value: "all", icon: "fas fa-list", image: null },
          ...categoriesData
        ]);
        const casinoCategory = categoriesData.find(cat => cat.value === 'casino');
        setSelectedCategory(casinoCategory ? 'casino' : categoriesData[0]?.value || 'all');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllGames = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/all-games`);
      if (response.data.success) {
        setAllGames(response.data.data);
        setGames(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching all games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = () => {
    let filtered = allGames;
    if (selectedCategory !== 'all') {
      filtered = allGames.filter(game => 
        game.category?.toLowerCase() === selectedCategory
      );
    }
    setGames(filtered);
    setProviders(extractUniqueProviders(filtered));
    setSelectedProviders([]);
    setVisibleGamesCount(16);
  };

  const extractUniqueProviders = (gamesList) => {
    const uniqueProviders = [...new Set(gamesList.map(game => game.provider))];
    return [
      { name: "All Providers", value: "all", icon: "fas fa-grid" },
      ...uniqueProviders.map(provider => ({
        name: provider,
        value: provider.toLowerCase(),
        icon: getProviderIcon(provider)
      }))
    ];
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'live':
      case 'live casino':
        return 'fas fa-video';
      case 'table':
      case 'table games':
        return 'fas fa-chess-board';
      case 'slots':
        return 'fas fa-sliders-h';
      case 'casino':
        return 'fas fa-dice';
      case 'crash':
        return 'fas fa-chart-line';
      default:
        return 'fas fa-list';
    }
  };

  const getProviderIcon = (providerName) => {
    switch (providerName.toLowerCase()) {
      case 'evolution':
        return 'fas fa-play-circle';
      case 'pragmatic play':
        return 'fas fa-dice';
      case 'playtech':
        return 'fas fa-gamepad';
      default:
        return 'fas fa-puzzle-piece';
    }
  };

  const toggleProvider = (value) => {
    setSelectedProviders(prev => 
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const toggleGameType = (type, checked) => {
    if (checked) {
      setSelectedGameTypes(prev => [...prev, type]);
    } else {
      setSelectedGameTypes(prev => prev.filter(t => t !== type));
    }
  };

  const toggleTheme = (theme, checked) => {
    if (checked) {
      setSelectedThemes(prev => [...prev, theme]);
    } else {
      setSelectedThemes(prev => prev.filter(t => t !== theme));
    }
  };

  const toggleSpecialFeature = (feature, checked) => {
    if (checked) {
      setSelectedSpecialFeatures(prev => [...prev, feature]);
    } else {
      setSelectedSpecialFeatures(prev => prev.filter(f => f !== feature));
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  useEffect(() => {
    let filtered = [...games];
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedProviders.length > 0 && !selectedProviders.includes('all')) {
      filtered = filtered.filter(game => 
        selectedProviders.includes(game.provider.toLowerCase())
      );
    }
    
    if (selectedGameTypes.length > 0) {
      filtered = filtered.filter(game => 
        selectedGameTypes.includes(game.type?.toLowerCase() || '')
      );
    }

    if (selectedThemes.length > 0 && !selectedThemes.includes('all')) {
      filtered = filtered.filter(game => 
        selectedThemes.includes(game.theme?.toLowerCase() || '')
      );
    }

    if (selectedSpecialFeatures.length > 0) {
      filtered = filtered.filter(game => 
        selectedSpecialFeatures.includes(game.specialFeature?.toLowerCase() || '')
      );
    }

    switch (sortOption) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default:
        break;
    }
    
    setFilteredGames(filtered);
    setVisibleGamesCount(16);
  }, [searchTerm, selectedProviders, selectedGameTypes, selectedThemes, selectedSpecialFeatures, sortOption, games]);

  const visibleGames = filteredGames.slice(0, visibleGamesCount);
  const hasMoreGames = visibleGamesCount < filteredGames.length;
  const loadingProgress = Math.min(100, (visibleGamesCount / filteredGames.length) * 100);

  const loadMoreGames = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleGamesCount(prevCount => prevCount + 16);
      setIsLoadingMore(false);
    }, 800);
  };

  const gameNames = [...new Set(games.map(game => game.name))];
  const filteredSuggestions = gameNames.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return "All Categories";
    const category = categories.find(c => c.value === selectedCategory);
    return category ? category.name : "All Categories";
  };

  const handleCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowCategoryDropdown(false);
  };

  const clearAllFilters = () => {
    setSelectedProviders([]);
    setSelectedGameTypes([]);
    setSelectedThemes(['all']);
    setSelectedSpecialFeatures([]);
    setSortOption('default');
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    handleOpenGame(game);
  };

  const handleOpenGame = async (game) => {
    if (!user) {
      toast.error('Please login to play games');
      setShowLoginPopup(true);
      return;
    }

    try {
      setGameLoading(true);
      const response = await axios.post(`${base_url}/api/user/play-game`, {
        gameID: game.gameID,
        slug: "/api/route",
        username: user.player_id,
        money: user.balance,
        userid: user.id
      });
      
      if (response.data.joyhobeResponse) {
        navigate('/single-game', {
          state: { gameUrl: response.data.joyhobeResponse }
        });
      } else {
        toast.error('Failed to load game. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to game server');
    } finally {
      setGameLoading(false);
    }
  };

  const handleLoginFromPopup = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  const handleRegisterFromPopup = () => {
    setShowLoginPopup(false);
    navigate('/register');
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Toaster />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className={`flex-1 overflow-auto transition-all duration-300 ${isLoading ? 'opacity-50' : ''}`}>
          <div className='mx-auto pb-[100px] w-full max-w-screen-xl py-4 px-4 sm:px-6 md:px-8 lg:px-12'>


            <div className='flex flex-wrap justify-center md:justify-between items-center gap-2 sm:gap-4 w-full mb-4 sm:mb-6'>
              <div className="w-full sm:w-auto relative" ref={categoryRef}>
                <button 
                  className="flex w-full sm:w-auto items-center justify-start cursor-pointer text-white pr-4 py-2 sm:py-3 rounded-lg min-w-[180px] text-xs sm:text-sm transition-colors"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <div className="flex items-center">
                    {categories.find(c => c.value === selectedCategory)?.image && (
                      <img 
                        src={`${base_url}/${categories.find(c => c.value === selectedCategory).image}`} 
                        alt="" 
                        className="mr-2 w-4 h-4" 
                      />
                    )}
                    <i className={`${categories.find(c => c.value === selectedCategory)?.icon || "fas fa-list"} mr-2 text-yellow-500`}></i>
                    <span>{getSelectedCategoryName()}</span>
                  </div>
                  {showCategoryDropdown ? <IoChevronUp className="text-sm ml-2" /> : <IoChevronDown className="text-sm ml-2" />}
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 text-xs sm:text-sm right-0 bg-[#222] border border-[#333] rounded-lg shadow-lg z-20 mt-1 overflow-hidden">
                    {categories.map(category => (
                      <div 
                        key={category.value}
                        className={`px-4 py-3 cursor-pointer flex items-center transition-colors ${selectedCategory === category.value ? ' bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleCategoryChange(category.value)}
                      >
                        {category.image && <img src={`${base_url}/${category.image}`} alt="" className="mr-2 w-4 h-4" />}
                        <i className={`${category.icon} mr-2 ${selectedCategory === category.value ? 'text-theme_color' : 'text-gray-400'}`}></i>
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
                <div className="relative" ref={sortRef}>
                  <button 
                    className="flex items-center justify-center cursor-pointer text-white px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <MdSort className="text-lg" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full right-0 bg-[#222] border border-[#333] rounded-lg shadow-lg z-20 mt-1 overflow-hidden w-48">
                      <div 
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors ${sortOption === 'default' ? 'bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleSortChange('default')}
                      >
                        Default
                      </div>
                      <div 
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors ${sortOption === 'name-asc' ? 'bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleSortChange('name-asc')}
                      >
                        Name (A-Z)
                      </div>
                      <div 
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors ${sortOption === 'name-desc' ? 'bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleSortChange('name-desc')}
                      >
                        Name (Z-A)
                      </div>
                      <div 
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors ${sortOption === 'newest' ? 'bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleSortChange('newest')}
                      >
                        Newest
                      </div>
                      <div 
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors ${sortOption === 'popularity' ? 'bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => handleSortChange('popularity')}
                      >
                        Most Popular
                      </div>
                    </div>
                  )}
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
                {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
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
              <div className='w-full p-[20px] flex justify-center items-center'>
                <div className="relative w-24 h-24 flex justify-center items-center">
                  <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                  <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                    <img className='w-16' src={logo} alt="Loading..." />
                  </div>
                </div>
              </div>
            ) : (
              visibleGames.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                    {visibleGames.map(game => (
                      <div 
                        key={game._id} 
                        className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-[3px] overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-yellow-500/10"
                        onClick={() => handleGameClick(game)}
                      >
                        <div className="relative overflow-hidden">
                          <img 
                            src={`${base_url}${game.portraitImage}`} 
                            alt={game.name} 
                            className="w-full h-[150px] xs:h-[180px] sm:h-[200px] md:h-[220px] object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className={`absolute inset-0 flex items-center justify-center md:bg-[rgba(0,0,0,0.2)] bg-opacity-40 transition-opacity duration-300 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <div className="bg-theme_color p-3 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                              </svg>
                            </div>
                          </div>
                          {game.featured && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                              NEW
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full">
                            <i className={`fas fa-heart ${game.isFavorite ? 'text-red-500' : 'text-white'}`}></i>
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
                        Showing {visibleGames.length} of {filteredGames.length} games
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <i className="fas fa-search text-4xl text-gray-500 mb-4"></i>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-300 mb-2">No games found</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )
            )}
          </div>
          <Footer />
        </div>
      </div>

      {showFilterSidebar && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-40" onClick={() => setShowFilterSidebar(false)} />
      )}
      {showFilterSidebar && (
        <div ref={filterSidebarRef} className={`fixed pt-6 top-0 right-0 h-full ${isMobile ? 'left-0 w-full' : 'w-80'} bg-[#0f0f0f] z-50 shadow-lg overflow-y-auto flex flex-col`}>
          <div className="flex items-center justify-between pt-[60px] px-4 pb-3 border-b border-[#333]">
            <h2 className="text-lg font-[600] text-white">Filter</h2>
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
              <label 
                className="block text-sm font-medium mb-3 flex items-center justify-between cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowProvidersDropdown(!showProvidersDropdown)}
              >
                <span>Providers</span>
                <IoChevronDown className={`text-sm transition-transform duration-200 ${showProvidersDropdown ? 'rotate-180' : ''}`} />
              </label>
              {showProvidersDropdown && (
                <div className="mt-2 pl-4 max-h-48 overflow-y-auto space-y-3">
                  {providers.map(provider => (
                    <label key={provider.value} className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                      <input 
                        type="checkbox" 
                        checked={selectedProviders.includes(provider.value)} 
                        onChange={() => toggleProvider(provider.value)} 
                        className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                      />
                      <div className="flex items-center ml-3">
                        <i className={`${provider.icon} mr-2 text-yellow-500 flex-shrink-0`}></i>
                        <span className="select-none text-gray-300">{provider.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-3 flex items-center justify-between cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowGameTypeDropdown(!showGameTypeDropdown)}
              >
                <span>Game Type</span>
                <IoChevronDown className={`text-sm transition-transform duration-200 ${showGameTypeDropdown ? 'rotate-180' : ''}`} />
              </label>
              {showGameTypeDropdown && (
                <div className="mt-2 pl-4 space-y-3">
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedGameTypes.includes('hot games')} 
                      onChange={(e) => toggleGameType('hot games', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Hot Games</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedGameTypes.includes('new games')} 
                      onChange={(e) => toggleGameType('new games', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">New Games</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-3 flex items-center justify-between cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              >
                <span>Theme</span>
                <IoChevronDown className={`text-sm transition-transform duration-200 ${showThemeDropdown ? 'rotate-180' : ''}`} />
              </label>
              {showThemeDropdown && (
                <div className="mt-2 pl-4 space-y-3">
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('all')} 
                      onChange={(e) => toggleTheme('all', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">All</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('lucky7')} 
                      onChange={(e) => toggleTheme('lucky7', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Lucky7</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('monetary')} 
                      onChange={(e) => toggleTheme('monetary', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Monetary</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('western')} 
                      onChange={(e) => toggleTheme('western', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Western</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('egyptian')} 
                      onChange={(e) => toggleTheme('egyptian', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Egyptian</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedThemes.includes('mythology')} 
                      onChange={(e) => toggleTheme('mythology', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Mythology</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label 
                className="block text-sm font-medium mb-3 flex items-center justify-between cursor-pointer text-gray-300 hover:text-white transition-colors"
                onClick={() => setShowSpecialFeatureDropdown(!showSpecialFeatureDropdown)}
              >
                <span>Special Feature</span>
                <IoChevronDown className={`text-sm transition-transform duration-200 ${showSpecialFeatureDropdown ? 'rotate-180' : ''}`} />
              </label>
              {showSpecialFeatureDropdown && (
                <div className="mt-2 pl-4 space-y-3">
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedSpecialFeatures.includes('bonus games')} 
                      onChange={(e) => toggleSpecialFeature('bonus games', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Bonus Games</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer text-sm relative py-2 px-1 rounded transition-colors hover:bg-[#1a1a1a]">
                    <input 
                      type="checkbox" 
                      checked={selectedSpecialFeatures.includes('buy feature')} 
                      onChange={(e) => toggleSpecialFeature('buy feature', e.target.checked)} 
                      className="w-6 h-6 text-theme_color bg-[#222] border-2 border-gray-600 rounded focus:ring-theme_color cursor-pointer"
                    />
                    <div className="flex items-center ml-3">
                      <span className="select-none text-gray-300">Buy Feature <span className="ml-1 text-xs text-gray-500">(bj)</span></span>
                    </div>
                  </label>
                </div>
              )}
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

      {showLoginPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div 
            ref={popupRef}
            className="bg-gradient-to-b cursor-pointer from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-6 max-w-md w-full relative"
          >
            <button 
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-center mb-6">
              <img 
                src={logo}
                alt="BJ Member Logo" 
                className="h-12"
              />
            </div>
            <p className="text-gray-300 text-xs sm:text-[15px] text-center mb-6">
              Please log in to play the game. If you don't have an account, sign up for free!
            </p>
            <div className="flex flex-col gap-3">
              <NavLink
                to="/register"
                onClick={handleRegisterFromPopup}
                className="bg-theme_color text-center hover:bg-theme_color/90 text-[14px] text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Sign up
              </NavLink>
              <NavLink
                to="/login"
                onClick={handleLoginFromPopup}
                className="bg-[#333] text-center hover:bg-[#444] text-[14px] text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Log in
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {gameLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <img 
                src={logo} 
                alt="Loading..." 
                className="w-20 h-20 object-contain animate-pulse"
              />
              <div className="absolute -inset-4 border-4 border-theme_color border-t-transparent rounded-full animate-spin"></div>
            </div>
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

const Casino = () => {
  return (
    <AuthProvider>
      <CasinoContent />
    </AuthProvider>
  );
};

export default Casino;