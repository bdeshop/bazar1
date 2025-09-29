import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import Footer from '../../components/footer/Footer';

const Lotttery = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [visibleGamesCount, setVisibleGamesCount] = useState(16); // Initial number of games to show
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchRef = useRef(null);
  const providerRef = useRef(null);
  const categoryRef = useRef(null);

  // Game data
  const games = [
    { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },
      { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },
      { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },
      { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },


      { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },  { 
      id: 1, 
      name: "CRAZY TIME", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/7451.webp",
      isFavorite: false,
      isNew: true
    },
    { 
      id: 2, 
      name: "SUPER SICBO", 
      provider: "evolution", 
      category: "live", 
      section: "popular",
      image: "https://xxxbetgames.com/image/vertical/50315.webp",
      isFavorite: true,
      isNew: false
    },
    // ... (all your game objects remain the same)
    { 
      id: 12, 
      name: "DREAM CATCHER", 
      provider: "pt", 
      category: "live", 
      section: "live",
      image: "https://xxxbetgames.com/image/vertical/26277.webp",
      isFavorite: true,
      isNew: true
    },
  ];

  // Provider data
  const providers = [
    { name: "All Providers", value: "all", icon: "fas fa-grid" },
    { name: "Evolution", value: "evolution", icon: "fas fa-play-circle" },
    { name: "Pragmatic Play", value: "pp", icon: "fas fa-dice" },
    { name: "Playtech", value: "pt", icon: "fas fa-gamepad" }
  ];

  // Category data
  const categories = [
    { name: "All Categories", value: "all", icon: "fas fa-list" },
    { name: "Live Casino", value: "live", icon: "fas fa-video" },
    { name: "Table Games", value: "table", icon: "fas fa-chess-board" }
  ];

  // Get unique game names for search suggestions
  const gameNames = [...new Set(games.map(game => game.name))];

  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || game.provider === selectedProvider;
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    
    return matchesSearch && matchesProvider && matchesCategory;
  });

  // Get visible games based on the count
  const visibleGames = filteredGames.slice(0, visibleGamesCount);

  // Check if there are more games to load
  const hasMoreGames = visibleGames.length < filteredGames.length;

  // Calculate loading progress
  const loadingProgress = Math.min(100, (visibleGames.length / filteredGames.length) * 100);

  // Load more games function
  const loadMoreGames = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setVisibleGamesCount(prevCount => prevCount + 16);
      setIsLoadingMore(false);
    }, 800);
  };

  // Reset visible games count when filters change
  useEffect(() => {
    setVisibleGamesCount(16);
  }, [searchTerm, selectedProvider, selectedCategory]);

  // Group games by section
  const popularGames = filteredGames.filter(game => game.section === 'popular');
  const tableGames = filteredGames.filter(game => game.section === 'table');
  const liveCasinoGames = filteredGames.filter(game => game.section === 'live');

  // Filter suggestions based on search term
  const filteredSuggestions = gameNames.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5); // Show only top 5 suggestions

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (providerRef.current && !providerRef.current.contains(event.target)) {
        setShowProviderDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected provider name
  const getSelectedProviderName = () => {
    const provider = providers.find(p => p.value === selectedProvider);
    return provider ? provider.name : "All Providers";
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    const category = categories.find(c => c.value === selectedCategory);
    return category ? category.name : "All Categories";
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className={`flex-1 overflow-auto transition-all duration-300`}>
          {/* Main Content Area */}
          <div className='mx-auto w-full max-w-screen-xl px-[10px] md:px-4 py-4'>
            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[17px] md:text-xl font-[600] text-white">Table Games</h1>
              <div className="text-sm text-gray-400">
                Showing <span className="text-yellow-400 font-medium">{visibleGames.length}</span> of <span className="text-yellow-400 font-medium">{filteredGames.length}</span> games
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="flex md:flex-row flex-col gap-4 mb-8 w-full">
              {/* Search Input */}
              <div className="flex relative md:w-[50%]" ref={searchRef}>
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
                <input
                  type="text"
                  placeholder="Search games..."
                  className="w-full pl-3 md:pl-10 pr-4 py-3 bg-[#222] border border-[#333] rounded-lg text-white relative text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-theme_color focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-[#222] border border-[#333] rounded-b-lg shadow-lg z-20 mt-1 overflow-hidden">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="px-4 py-3 hover:bg-[#333] cursor-pointer border-b border-[#333] last:border-b-0 transition-colors"
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        <i className="fas fa-search text-gray-400 mr-2 text-xs"></i>
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

             <div className='flex justify-center md:justify-end items-center gap-[10px] md:w-[50%]'>
               {/* Provider Dropdown */}
              <div className="md:w-auto w-[50%]  relative" ref={providerRef}>
                <button 
                  className="flex md:w-auto w-full cursor-pointer items-center justify-between text-xs md:text-sm bg-[#222] border border-[#333] text-white px-4 py-3 rounded-lg min-w-[180px] hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                >
                  <div className="flex items-center">
                    <i className={`${providers.find(p => p.value === selectedProvider)?.icon || "fas fa-grid"} mr-2 text-theme_color`}></i>
                    <span>{getSelectedProviderName()}</span>
                  </div>
                  <i className={`fas fa-chevron-${showProviderDropdown ? 'up' : 'down'} text-xs ml-2`}></i>
                </button>
                
                {showProviderDropdown && (
                  <div className="absolute top-full left-0 right-0  text-xs md:text-sm bg-[#222] border border-[#333] rounded-lg shadow-lg z-20 mt-1 overflow-hidden">
                    {providers.map(provider => (
                      <div 
                        key={provider.value}
                        className={`px-4 py-3 cursor-pointer flex items-center transition-colors ${selectedProvider === provider.value ? ' bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => {
                          setSelectedProvider(provider.value);
                          setShowProviderDropdown(false);
                        }}
                      >
                        <i className={`${provider.icon} mr-2 ${selectedProvider === provider.value ? 'text-theme_color' : 'text-gray-400'}`}></i>
                        {provider.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="md:w-auto w-[50%] relative" ref={categoryRef}>
                <button 
                  className="flex md:w-auto w-full items-center justify-between cursor-pointer bg-[#222] border border-[#333] text-white px-4 py-3 rounded-lg min-w-[180px] text-xs md:text-sm hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <div className="flex items-center">
                    <i className={`${categories.find(c => c.value === selectedCategory)?.icon || "fas fa-list"} mr-2 text-yellow-500`}></i>
                    <span>{getSelectedCategoryName()}</span>
                  </div>
                  <i className={`fas fa-chevron-${showCategoryDropdown ? 'up' : 'down'} text-xs ml-2`}></i>
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 text-xs md:text-sm right-0 bg-[#222] border border-[#333] rounded-lg shadow-lg z-20 mt-1 overflow-hidden">
                    {categories.map(category => (
                      <div 
                        key={category.value}
                        className={`px-4 py-3 cursor-pointer flex items-center transition-colors ${selectedCategory === category.value ? ' bg-opacity-10 text-theme_color' : 'hover:bg-[#2a2a2a]'}`}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <i className={`${category.icon} mr-2 ${selectedCategory === category.value ? 'text-theme_color' : 'text-gray-400'}`}></i>
                        {category.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
             </div>
            </div>

            {/* Games Grid */}
            {visibleGames.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4">
                  {visibleGames.map(game => (
                    <div key={`${game.id}-${game.name}`} className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-[3px] md:rounded-[5px] overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-yellow-500/10">
                      <div className="relative overflow-hidden">
                        <img 
                          src={game.image} 
                          alt={game.name} 
                          className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button and Progress Bar */}
                {hasMoreGames && (
                  <div className="mt-8 flex flex-col items-center">
                    {/* Progress Bar */}
                    <div className="w-full max-w-sm bg-[#222] rounded-full h-2.5 mb-4 overflow-hidden">
                      <div 
                        className="bg-theme_color h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    
                    {/* Load More Button */}
                    <button
                      onClick={loadMoreGames}
                      disabled={isLoadingMore}
                      className="px-6 py-3 bg-theme_color text-[12px] md:text-[14px] cursor-pointer text-white font-medium rounded-lg hover:bg-theme_color/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    
                    <p className="text-gray-400 text-xs md:text-sm mt-2">
                      Showing {visibleGames.length} of {filteredGames.length} games
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-search text-4xl text-gray-500 mb-4"></i>
                <h3 className="text-sm md:text-lg font-semibold text-gray-300 mb-2">No games found</h3>
                <p className="text-xs md:text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Footer */}
          </div>
          <Footer />
        </div>
      </div>

      {/* Custom CSS for scrollbar */}
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

export default Lotttery;