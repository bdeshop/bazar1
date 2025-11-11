import React, { useState, useEffect, memo } from "react";
import axios from "axios";

// Simple cache to store banners
let bannerCache = [];

export const Slider = memo(() => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(bannerCache); // Initialize with cache
  const [loading, setLoading] = useState(!bannerCache.length); // Skip loading if cached
  const [error, setError] = useState(null);

  // Fetch banners from API
  useEffect(() => {
    // If cache exists, skip fetch
    if (bannerCache.length > 0) {
      setSlides(bannerCache);
      setLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/banners`);

        if (response.data.success) {
          // Transform API data to match the expected format
          const bannerData = response.data.data.map((banner) => ({
            id: banner._id,
            src: banner.image,
            alt: banner.name || "Banner",
          }));

          // Update cache and state
          bannerCache = bannerData;
          setSlides(bannerData);
        } else {
          setError("Failed to fetch banners");
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Error loading banners");

        // Fallback to default slides if API fails
        const fallbackSlides = [
          {
            id: 1,
            src: "https://img.b112j.com/upload/announcement/image_241602.jpg",
            alt: "Slider 1",
          },
          {
            id: 2,
            src: "https://img.b112j.com/upload/announcement/image_241701.jpg",
            alt: "Slider 2",
          },
          {
            id: 3,
            src: "https://img.b112j.com/upload/announcement/image_242355.jpg",
            alt: "Slider 3",
          },
        ];
        bannerCache = fallbackSlides; // Cache fallback slides
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // Keep base_url in dependency array

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    if (slides.length === 0) return;
    setCurrentSlide(index);
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return; // Don't auto-slide if only one slide

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]); // Depend on slides.length to avoid unnecessary re-runs

  if (loading) {
    return (
      <div className="relative w-full h-[180px] md:h-[200px] lg:h-[250px] overflow-hidden">
        <div className="w-full h-full bg-gray-200 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
        </div>
      </div>
    );
  }

  if (error && slides.length === 0) {
    return (
      <div className="relative w-full h-[180px] md:h-[200px] lg:h-[250px] flex items-center justify-center bg-gray-200">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[180px] md:h-[200px] lg:h-[250px] flex items-center justify-center bg-gray-200">
        <div className="text-gray-500">No banners available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full  flex-shrink-0">
            <img
              // src={`${base_url}${slide.src}`}
              src={`${base_url}/${slide.src}`}
              alt={slide.alt}
              className="w-full object-cover h-[200px] md:h-full"
              loading="lazy" // Add lazy loading for images
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows - only show if multiple slides */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute md:left-8 lg:left-20 top-1/2 md:flex hidden cursor-pointer -translate-y-1/2 bg-[#303232] hover:bg-[#303232]/50 text-white p-1.5 rounded-[2px] transition-colors duration-300"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute md:right-8 lg:right-20 top-1/2 md:flex hidden cursor-pointer -translate-y-1/2 bg-[#303232] hover:bg-[#303232]/50 text-white p-1.5 rounded-[2px] transition-colors duration-300"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Indicators - only show if multiple slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer duration-300 ${
                index === currentSlide
                  ? "bg-theme_color w-6"
                  : "bg-theme_gray/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Optional: Clear cache when needed (e.g., on logout or data refresh)
export const clearBannerCache = () => {
  bannerCache = [];
};
