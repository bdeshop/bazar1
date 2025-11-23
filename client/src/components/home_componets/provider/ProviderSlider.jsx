import React, { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProviderSlider = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Ref to the slider container for scrolling
  const sliderRef = useRef(null);
  const autoSlideInterval = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProviders();
    
    // Clean up interval on component unmount
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Start auto-slide when providers are loaded
    if (providers.length > 0 && !isPaused) {
      startAutoSlide();
    }
    
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [providers, isPaused]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/providers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch providers');
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to scroll the slider to the left
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  // Function to scroll the slider to the right
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  // Start auto-slide functionality
  const startAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }
    
    autoSlideInterval.current = setInterval(() => {
      if (sliderRef.current) {
        // Check if we've reached the end
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        
        if (isAtEnd) {
          // If at the end, scroll back to the beginning
          sliderRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Otherwise, scroll to the right
          scrollRight();
        }
      }
    }, 3000); // Slide every 3 seconds
  };

  // Pause auto-slide when user interacts with the slider
  const handleSliderInteraction = () => {
    setIsPaused(true);
    
    // Resume auto-slide after a delay of inactivity
    setTimeout(() => {
      setIsPaused(false);
    }, 5000); // Resume after 5 seconds of inactivity
  };

  // Function to truncate provider name
  const truncateName = (name, maxLength = 20) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...';
    }
    return name;
  };

  // Handle provider click - navigate to all-games with provider query
  const handleProviderClick = (provider) => {
    // Encode the provider name for URL
    const encodedProviderName = encodeURIComponent(provider.name.toLowerCase());
    
    // Navigate to all-games page with provider query parameter
    navigate(`/all-games?provider=${encodedProviderName}`);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Providers
          </h2>
        </div>
        <div className="flex justify-center items-center h-24">
          <p className="text-gray-400">Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Providers
          </h2>
        </div>
        <div className="flex justify-center items-center h-24">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .truncate-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 120px; /* Adjust as needed */
          }
          .provider-card {
            transition: all 0.3s ease;
          }
          .provider-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
      <div className="bg-[#1a1a1a] px-2 md:p-4 pt-7 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Providers
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll left"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll right"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-3 md:gap-4 py-2 scrollbar-hide snap-x snap-mandatory"
          onMouseEnter={() => setIsPaused(true)} // Pause on hover
          onMouseLeave={() => setIsPaused(false)} // Resume when not hovering
          onTouchStart={() => setIsPaused(true)} // Pause on touch
          onScroll={handleSliderInteraction} // Pause on scroll interaction
        >
          {providers.length > 0 ? (
            providers.map((provider, index) => (
              <div
                key={index}
                className="provider-card flex-shrink-0 md:w-40 md:h-20 bg-box_bg flex rounded-[3px] items-center justify-between gap-4 p-2 snap-center transform transition-transform duration-200 hover:scale-105 cursor-pointer"
                onClick={() => handleProviderClick(provider)}
                title={`View ${provider.name} games`}
              >
                <img
                  src={`${base_url}/${provider.image}`}
                  alt={provider.name}
                  className="w-12 md:w-14 object-contain"
                />
                <span className="mt-2 pr-2 text-sm text-center text-gray-400 font-[600] truncate-text">
                  {truncateName(provider.name)}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full flex justify-center items-center">
              <p className="text-gray-400">No providers available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProviderSlider;