import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { FaRegEdit, FaTrashAlt, FaCircle } from "react-icons/fa";

const Promotions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Categories from the image
  const categories = [
    "ALL",
    "Welcome Offer",
    "Slots",
    "Casino",
    "Sports",
    "Fishing",
    "Card",
    "E-sports",
    "Lottery",
    "P2P",
    "Table",
    "Others",
    "Arcade",
    "Crcs"
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get(`${base_url}/api/promotions`);
        console.log(response);
        if (response.data) {
          setPromotions(response.data.data);
          setFilteredPromotions(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        setError("Failed to fetch promotions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [base_url]);

  // Filter promotions based on active category
  useEffect(() => {
    if (activeCategory === "ALL") {
      setFilteredPromotions(promotions);
    } else {
      const filtered = promotions.filter(promo => 
        promo.category === activeCategory || 
        (promo.categories && promo.categories.includes(activeCategory))
      );
      setFilteredPromotions(filtered);
    }
  }, [activeCategory, promotions]);

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white ">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
               <Sidebar sidebarOpen={sidebarOpen} />


        {/* Main Content Area */}
        <div className={`flex-1 overflow-auto transition-all duration-300 px-4`}>
          <div className="max-w-6xl mx-auto py-8">
            <div className="mb-6 sm:mb-8 flex justify-between items-center">
              <h1 className="text-base sm:text-lg md:text-xl font-[500] text-white">
                All Promotions
              </h1>
              {/* <button className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-xs md:text-sm px-3 py-2 rounded-md flex items-center">
                Add promotion code
              </button> */}
            </div>
            
            {/* Category Tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 min-w-max pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-2 text-xs md:text-sm rounded-[3px] whitespace-nowrap ${
                      activeCategory === category
                        ? "bg-theme_color text-white cursor-pointer font-medium"
                        : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <hr className="my-6 border-gray-700" />
            
            {/* Main content grid for promotions */}
            <div className="min-h-[calc(100vh-250px)]">
              {loading && (
                <div className="text-center text-gray-400 text-base">
                  Loading...
                </div>
              )}
              {error && (
                <div className="text-center text-red-500 text-base">
                  Error: {error}
                </div>
              )}
              {!loading && !error && filteredPromotions.length === 0 && (
                <div className="text-center text-gray-400 text-base">
                  No promotions found in this category.
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredPromotions.map((promo) => (
                  <div
                    key={promo._id}
                    className="relative bg-[#2a2a2a] rounded-[5px] overflow-hidden flex flex-col items-center transition-all duration-300 transform hover:scale-105"
                  >
                    {/* Tag system */}
                    {promo.tag && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`text-xs px-2 py-1 rounded-md ${
                          promo.tag === "NEW" 
                            ? "bg-red-500 text-white" 
                            : promo.tag === "DOUBLE" 
                              ? "bg-blue-500 text-white"
                              : "bg-yellow-500 text-black"
                        }`}>
                          {promo.tag}
                        </span>
                      </div>
                    )}
                    
                    <a href={promo.targetUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <img
                        src={base_url + promo.image}
                        alt={promo.title}
                        className="w-full h-28 sm:h-36 md:h-44 object-cover"
                      />
                    </a>
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <FaCircle
                        className={`h-2 w-2 ${
                          promo.status ? "text-green-500" : "text-red-500"
                        }`}
                      />
                    </div>
                    <div className="w-full p-3 text-left">
                      <h3 className="text-sm sm:text-base font-[500] mb-1 line-clamp-1">
                        {promo.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                        {promo.description}
                      </p>
                      <div className="text-xs font-light text-gray-500">
                        <p>
                          <span className="font-medium">Start:</span>{" "}
                          {formatDate(promo.startDate)}
                        </p>
                        <p>
                          <span className="font-medium">End:</span>{" "}
                          {formatDate(promo.endDate)}
                        </p>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button className="text-xs text-blue-400 hover:text-blue-300">
                          Read more &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Promotions;