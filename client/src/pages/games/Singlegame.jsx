import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import Footer from '../../components/footer/Footer';
import { Header } from '../../components/header/Header';

const Singlegame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gameUrl, setGameUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    if (location.state?.gameUrl) {
      setGameUrl(location.state.gameUrl);
      setGameInfo(location.state.gameInfo || null);
      setLoading(false);
    } else {
      // Fallback for direct access or if state is lost
      setError("Game URL not found");
      setLoading(false);
    }
  }, [location]);

  // Force minimum 3-second loader for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToGames = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="golden-loader">
                  <span>L</span>
                  <span>O</span>
                  <span>A</span>
                  <span>D</span>
                  <span>I</span>
                  <span>N</span>
                  <span>G</span>
                </div>
                <p className="mt-6 text-xl font-semibold text-amber-200">Preparing your game...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-500 text-xl mb-4">{error}</p>
              <button 
                onClick={handleBackToGames}
                className="px-6 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#0f0f0f] text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className="flex-1 overflow-auto relative">
          {/* Game Info Bar */}
          {gameInfo && (
            <div className="bg-[#1a1a1a] p-3 flex justify-between items-center border-b border-[#333]">
              <div className="flex items-center">
                <button 
                  onClick={handleBackToGames}
                  className="mr-4 p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <img 
                  src={gameInfo.image} 
                  alt={gameInfo.name} 
                  className="w-10 h-10 object-cover rounded mr-3"
                />
                <div>
                  <h2 className="font-semibold">{gameInfo.name}</h2>
                  <p className="text-sm text-gray-400 capitalize">{gameInfo.provider}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <button className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors mr-2">
                  <i className="fas fa-info-circle"></i>
                </button>
                <button className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors">
                  <i className="fas fa-expand"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Loader Overlay */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] z-10">
              <div className="text-center">
                <div className="golden-loader">
                  <span>L</span>
                  <span>O</span>
                  <span>A</span>
                  <span>D</span>
                  <span>I</span>
                  <span>N</span>
                  <span>G</span>
                </div>
                <p className="mt-6 text-xl font-semibold text-amber-200">Game is loading...</p>
                <p className="text-gray-400 mt-2 text-sm">Please wait while we prepare your gaming experience</p>
              </div>
            </div>
          )}
          
          {/* Game Iframe */}
          {gameUrl ? (
            <iframe
              className="w-full h-full min-h-[calc(100vh-120px)]"
              src={gameUrl}
              frameBorder="0"
              allowFullScreen
              title="Game"
              onLoad={() => setIframeLoaded(true)}
              style={{ visibility: iframeLoaded ? 'visible' : 'hidden' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <p className="text-xl mb-4">Game not available</p>
                <button 
                  onClick={handleBackToGames}
                  className="px-6 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Singlegame;