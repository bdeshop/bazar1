import React, { useRef, useEffect, useState } from 'react';
import axios from "axios"

const Event = () => {
  const sliderRef = useRef(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/events`);
        
        if (response.data.success) {
          setEvents(response.data.data);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error loading events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [base_url]);

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

  // Auto-slide functionality
  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (sliderRef.current && events.length > 0) {
        const { scrollWidth, scrollLeft, clientWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const currentScroll = scrollLeft;
        
        if (currentScroll >= maxScroll) {
          sliderRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          sliderRef.current.scrollBy({
            left: 200,
            behavior: 'smooth'
          });
        }
      }
    }, 3000);

    return () => clearInterval(slideInterval);
  }, [events]); // Added events as dependency

  // Function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/400x200/1a1a1a/ffffff?text=No+Image";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, construct the full URL using your base URL
    return `${base_url}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] pt-5 px-2 md:p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Event
          </h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] pt-5 px-2 md:p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Event
          </h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-[#1a1a1a] pt-5 px-2 md:p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Event
          </h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-400">No events available</p>
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
        `}
      </style>
      <div className="bg-[#1a1a1a] pt-5 px-2 md:p-4 font-inter text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] md:text-lg font-semibold flex items-center">
            <span className="w-1 h-6 bg-theme_color mr-2 rounded-full"></span>
            Event
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={scrollRight}
              className="p-2 bg-box_bg hover:bg-box_bg/90 cursor-pointer rounded-[3px] transition-colors duration-200"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-3 md:gap-1 md:py-2 scrollbar-hide snap-x snap-mandatory"
        >
          {events.map((event, index) => (
            <div
              key={event._id || index}
              className="flex-shrink-0 w-[200px] h-30 md:w-[400px] md:h-[200px] rounded-[3px] md:rounded-[5px] flex flex-col items-center justify-center md:p-2 snap-center transform transition-transform duration-200 hover:scale-105 cursor-pointer"
            >
              <img
                src={getImageUrl(event.image)}
                alt={event.title || `Event ${index + 1}`}
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Event;