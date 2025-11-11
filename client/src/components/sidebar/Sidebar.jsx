import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaCrown,
  FaUserFriends,
  FaHandshake,
} from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";
import axios from "axios";

const Sidebar = ({ sidebarOpen, onCategorySelect }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (title) => {
    if (activeMenu === title) {
      setActiveMenu(null);
      setActiveSubMenu(null);
    } else {
      setActiveMenu(title);
      setActiveSubMenu(null);
    }
  };

  const toggleSubMenu = (subItem) => {
    if (activeSubMenu === subItem) {
      setActiveSubMenu(null);
    } else {
      setActiveSubMenu(subItem);
    }
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const secondaryMenuItems = [
    {
      title: "Promotions",
      icon: <FaGift className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Welcome Bonus", "Reload Bonus", "Cashback"],
    },
    {
      title: "VIP Club",
      icon: <FaCrown className="w-5 h-5 min-w-[20px]" />,
      subItems: ["VIP Levels", "Exclusive Rewards", "Personal Manager"],
    },
    {
      title: "Referral program",
      icon: <FaUserFriends className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Invite Friends", "Earn Commission", "Bonus Terms"],
    },
    {
      title: "Affiliate",
      icon: <FaHandshake className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Join Program", "Marketing Tools", "Commission Rates"],
    },
  ];

  if (loading) {
    return (
      <div
        className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-[#1a1a1a] text-white overflow-y-auto
          transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? "w-75 "
              : "w-20 -translate-x-full py-4 md:translate-x-0"
          }`}
      ></div>
    );
  }

  return (
    <div
      className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-[#1a1a1a] text-white overflow-y-auto
        transition-all duration-300 ease-in-out px-2
        ${sidebarOpen ? "w-75" : "w-15 -translate-x-full md:translate-x-0"}`}
    >
      {/* Logo - Only show when sidebar is open */}
      <span
        className={`w-full flex justify-start items-center px-4 pt-4 pb-3 transition-all duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 h-0 p-0 mb-0"
        }`}
      >
        {sidebarOpen ? (
          <span className="bg-theme_gray p-2 rounded-[3px] text-center flex justify-center items-center gap-3">
            <MdSupportAgent className="text-white text-[20px]" />
            <span className="text-[13px]">24/7 Live Chat</span>
          </span>
        ) : (
          <span className="bg-theme_gray p-2 rounded-[3px] text-center flex justify-center items-center gap-3">
            <MdSupportAgent className="text-white text-[20px]" />
          </span>
        )}
      </span>
      {!sidebarOpen ? (
        <span className="bg-theme_gray p-2 rounded-[3px] text-center flex justify-center items-center gap-3">
          <MdSupportAgent className="text-white text-[20px]" />
        </span>
      ) : (
        ""
      )}

      <div className={sidebarOpen ? "p-[10px]" : "hidden"}>
        <img
          className="w-full"
          src="https://img.b112j.com/upload/h5Announcement/image_182702.jpg"
          alt=""
        />
      </div>

      {/* Main menu items - Categories from API */}
      <div className="space-y-1  mt-[15px]">
        {categories.map((category, index) => (
          <div key={category._id}>
            <div
              className={`flex items-center p-3 rounded cursor-pointer hover:text-gray-500 text-gray-400 transition-colors duration-200 ${
                activeMenu === category.name ? "" : ""
              }`}
              onClick={() => {
                toggleMenu(category.name);
                handleCategoryClick(category);
              }}
            >
              <img
                src={`${base_url}/${category.image}`}
                alt={category.name}
                className="w-5 h-5 min-w-[20px] object-contain"
              />
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  sidebarOpen ? "ml-3 w-full" : "w-0"
                }`}
              >
                <span className="text-sm flex-grow whitespace-nowrap">
                  {category.name}
                </span>
                {category.providers &&
                  category.providers.length > 0 &&
                  (activeMenu === category.name ? (
                    <FaChevronDown className="text-xs transition-transform duration-200" />
                  ) : (
                    <FaChevronRight className="text-xs transition-transform duration-200" />
                  ))}
              </div>
            </div>

            {/* Submenu items - Providers for each category */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarOpen &&
                activeMenu === category.name &&
                category.providers &&
                category.providers.length > 0
                  ? "max-h-96"
                  : "max-h-0"
              }`}
            >
              {sidebarOpen && category.providers && (
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {category.providers.map((provider) => (
                    <div
                      key={provider._id}
                      className={`p-2 text-xs rounded cursor-pointer hover:bg-[#333] transition-colors duration-200 ${
                        activeSubMenu === provider.name ? "bg-[#333]" : ""
                      }`}
                      onClick={() => toggleSubMenu(provider.name)}
                    >
                      {provider.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className={`border-t border-[#222424] my-4 mx-2 transition-all duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Promotions section */}
      <div
        className={`px-2 mb-2 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-2">
          <span className="text-sm font-medium">Promotions</span>
          <span className="text-xs text-theme_color2 underline cursor-pointer">
            View all
          </span>
        </div>
      </div>

      {/* Secondary menu items */}
      <div className="space-y-1 ">
        {secondaryMenuItems.map((item, index) => (
          <div key={index}>
            <div
              className={`flex items-center p-3 rounded text-gray-500 cursor-pointer hover:text-gray-600 transition-colors duration-200 ${
                activeMenu === item.title ? "bg-[#333]" : ""
              }`}
              onClick={() => toggleMenu(item.title)}
            >
              {item.icon}
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  sidebarOpen ? "ml-3 w-full" : "w-0"
                }`}
              >
                <span className="text-sm flex-grow whitespace-nowrap">
                  {item.title}
                </span>
                {item.subItems.length > 0 &&
                  (activeMenu === item.title ? (
                    <FaChevronDown className="text-xs transition-transform duration-200" />
                  ) : (
                    <FaChevronRight className="text-xs transition-transform duration-200" />
                  ))}
              </div>
            </div>

            {/* Submenu items */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarOpen &&
                activeMenu === item.title &&
                item.subItems.length > 0
                  ? "max-h-96"
                  : "max-h-0"
              }`}
            >
              {sidebarOpen && (
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`p-2 text-xs rounded cursor-pointer hover:bg-[#333] transition-colors duration-200 ${
                        activeSubMenu === subItem ? "bg-[#333]" : ""
                      }`}
                      onClick={() => toggleSubMenu(subItem)}
                    >
                      {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom spacing */}
      <div className="h-10"></div>
    </div>
  );
};

export default Sidebar;
