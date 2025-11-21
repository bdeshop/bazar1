import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaCrown,
  FaUserFriends,
  FaHandshake,
  FaPhone,
  FaBook,
  FaComments,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { MdSupportAgent } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import {
  FiBell,
  FiUser,
  FiLock,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { MdSportsSoccer } from "react-icons/md";
import axios from "axios";
import logo from "../../assets/logo.png";
import slot_img from "../../assets/slots.png";
import casino_img from "../../assets/casino.png";
import banner from "../../assets/banner.jpg";
import play_img from "../../assets/play.png";
import profile_img from "../../assets/profile.png";
import menu_img from "../../assets/icon-menu.png";
import toast, { Toaster } from "react-hot-toast";

export const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [categories, setCategories] = useState(
    JSON.parse(localStorage.getItem("categories")) || []
  );
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [promotions, setPromotions] = useState(
    JSON.parse(localStorage.getItem("promotions")) || []
  );
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen(false);
    }
    if (!categories.length) fetchCategories();
    if (!promotions.length) fetchPromotions();
    checkAuthStatus();
    const hasShownSignupPopup = localStorage.getItem("hasShownSignupPopup");
    if (isLoggedIn && !hasShownSignupPopup) {
      setShowSignupPopup(true);
      localStorage.setItem("hasShownSignupPopup", "true");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowSignupPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
        localStorage.setItem("categories", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/promotions`);
      if (response.data) {
        setPromotions(response.data.data);
        localStorage.setItem("promotions", JSON.stringify(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      toast.error("Failed to fetch promotions.");
    }
  };

  const fetchProviders = async (categoryName) => {
    try {
      setSidebarLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/providers/${categoryName}`
      );
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const fetchExclusiveGames = async (categoryName) => {
    try {
      setSidebarLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/games/category/${categoryName.toLowerCase()}?limit=20`
      );
      if (response.data.success) {
        setExclusiveGames(response.data.data);
        setProviders([]);
      }
    } catch (error) {
      console.error("Error fetching exclusive games:", error);
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (activeMenu === category.name) {
      setActiveMenu(null);
      setProviders([]);
      setExclusiveGames([]);
    } else {
      setActiveMenu(category.name);
      if (category.name.toLowerCase() === "exclusive") {
        fetchExclusiveGames(category.name);
      } else {
        fetchProviders(category.name);
      }
    }
  };

  const handleProviderClick = (provider) => {
    if (activeMenu) {
      navigate(
        `/games?category=${activeMenu.toLowerCase()}&provider=${provider.name.toLowerCase()}`
      );
      setSidebarOpen(false);
    }
  };

  const handleGameClick = async (game) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setGameLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/user/play-game`, {
        gameID: game.gameID,
        slug: "/api/route",
        username: userData.player_id,
        money: userData.balance,
        userid: userData.id,
      });

      if (response.data.joyhobeResponse) {
        navigate("/single-game", {
          state: { gameUrl: response.data.joyhobeResponse },
        });
      } else {
        toast.error("Failed to load game. Please try again.");
      }
    } catch (err) {
      console.error("Error connecting to game server:", err);
      toast.error("Error connecting to game server");
    } finally {
      setGameLoading(false);
      setSidebarOpen(false);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
      verifyToken(token);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  const verifyToken = async (token) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(
        `${API_BASE_URL}/api/user/my-information`
      );
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    delete axios.defaults.headers.common["Authorization"];
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const menuItems = [
    {
      id: "notifications",
      label: "Notifications",
      icon: <FiBell />,
      path: "/member/inbox/notification",
    },
    {
      id: "personal-info",
      label: "Personal info",
      icon: <FiUser />,
      path: "/member/profile/info",
    },
    {
      id: "login-security",
      label: "Login & Security",
      icon: <FiLock />,
      path: "/member/profile/account",
    },
    {
      id: "verification",
      label: "Verification",
      icon: <FiCheckCircle />,
      path: "/member/profile/verify",
    },
    {
      id: "transactions",
      label: "Transaction records",
      icon: <FiFileText />,
      path: "/member/transaction-records",
    },
    {
      id: "betting-records",
      label: "Betting records",
      icon: <MdSportsSoccer />,
      path: "/member/betting-records/settled",
    },
    {
      id: "turnover",
      label: "Turnover",
      icon: <FiTrendingUp />,
      path: "/member/turnover/uncomplete",
    },
    {
      id: "referral",
      label: "My referral",
      icon: <FiUsers />,
      path: "/referral-program/details",
    },
  ];

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

  const bottomMenuItems = [
    {
      title: "Contact Us",
      icon: <FaPhone className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Whatsapp", "Email", "Facebook"],
    },
    {
      title: "New Member Guide",
      icon: <FaBook className="w-5 h-5 min-w-[20px]" />,
      subItems: [],
    },
    {
      title: "BJ Forum",
      icon: <FaComments className="w-5 h-5 min-w-[20px]" />,
      subItems: [],
    },
  ];

  const toggleMenu = (title) => {
    if (activeMenu === title) {
      setActiveMenu(null);
      setActiveSubMenu(null);
      setProviders([]);
      setExclusiveGames([]);
    } else {
      setActiveMenu(title);
      setActiveSubMenu(null);
    }
  };

  const toggleSubMenu = (subItem) => {
    setActiveSubMenu(activeSubMenu === subItem ? null : subItem);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <>
      <Toaster />
      <header className="flex justify-between items-center p-3 bg-[#1a1a1a] text-white border-b border-[#333] relative z-[10000]">
        <div className="flex items-center space-x-4 md:space-x-7">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-icon_color md:flex hidden p-3 cursor-pointer bg-[#303232] rounded-[2px] hover:bg-[#333]"
          >
            <FaBars size={18} />
          </button>
          <NavLink to="/">
            <img src={logo} alt="Logo" className="w-16" />
          </NavLink>
          <img className="w-[30px]" src={play_img} alt="" />
          <NavLink
            to="/slots"
            className="md:flex hidden items-center space-x-2 text-[13px] font-[400] text-gray-400 hover:text-yellow-400"
          >
            <img src={slot_img} alt="Slots" className="h-5 w-5" />
            <span>Slots</span>
          </NavLink>
          <NavLink
            to="/casino"
            className="md:flex hidden items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400"
          >
            <img src={casino_img} alt="Casino" className="h-5 w-5" />
            <span>Casino</span>
          </NavLink>
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="md:flex hidden cursor-pointer items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400"
              >
                <img src={profile_img} alt="Profile" className="h-5 w-5" />
                <span>Profile</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute top-[170%] left-0 mt-2 w-80 bg-[#111] rounded-b-[3px] shadow-xl z-50 text-white">
                  <div className="flex items-center gap-3 p-4 border-b border-[#333]">
                    <div className="rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                      <img
                        src="https://img.b112j.com/bj/h5/assets/v3/images/member-menu/member-avatar.png?v=1755600713311&source=drccdnsrc"
                        className="w-[40px]"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="font-[500] text-sm">
                        Username: {userData?.username || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Player ID: {userData?.player_id || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col py-3">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                          activeTab === item.id
                            ? "bg-[#222] text-white"
                            : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                        }`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setProfileDropdownOpen(false);
                        }}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                  <div className="border-t border-[#333] p-3">
                    <button
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm rounded-md border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition"
                      onClick={logout}
                    >
                      <FiLogOut /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="flex items-center rounded overflow-hidden gap-2">
              <div className="bg-box_bg hidden md:flex rounded-[5px] h-10 border-[1px] border-gray-800">
                <div className="flex items-center space-x-1 px-2 py-[6px] text-sm bg-[#1f1f1f] text-white">
                  <img
                    src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/currency-type/vp.png?v=1755600713311&source=drccdnsrc"
                    className="w-4 h-4"
                    alt="VIP"
                  />
                  <span className="min-w-[60px]">
                    {showBalance ? userData?.balance || "N/A" : "********"}
                  </span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-[6px] text-sm bg-[#1f1f1f] text-white">
                  <img
                    src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/currency-type/bdt.png?v=1755600713311&source=drccdnsrc"
                    className="w-4 h-4"
                    alt="BDT"
                  />
                  <span className="min-w-[60px]">
                    {showBalance ? userData?.balance || "N/A" : "********"}
                  </span>
                </div>
                <button
                  className="px-2 py-1 hover:bg-[#444] cursor-pointer text-white transition-colors duration-200"
                  onClick={toggleBalanceVisibility}
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-center items-center gap-2">
                <NavLink
                  to="/member/withdraw"
                  className="text-white text-[12px] md:text-sm px-5 py-2 border-[1px] cursor-pointer border-gray-700 rounded hover:bg-[#333] transition-all duration-200"
                >
                  Withdrawal
                </NavLink>
                <NavLink
                  to="/member/deposit"
                  className="bg-theme_color text-[12px] md:text-sm px-5 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
                >
                  Deposit
                </NavLink>
              </div>
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-white text-[12px] md:text-sm px-5 py-2 border-[1px] cursor-pointer border-gray-700 rounded hover:bg-[#333] transition-all duration-200"
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="bg-theme_color text-[12px] md:text-sm px-5 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </header>

      <div
        className={`fixed top-0 left-0 h-full w-full md:w-80 no-scrollbar overflow-y-auto pb-[100px] bg-[#1a1a1a] text-white z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "shadow-2xl" : "w-0 -translate-x-full"
        }`}
        style={{ marginTop: "56px" }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-3 right-3 cursor-pointer p-2 rounded-[3px] bg-[#303232] hover:bg-[#333] z-50"
        >
          <IoClose size={18} />
        </button>
        <div
          className={`w-full md:w-80 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full flex justify-start items-center px-4 pt-4 pb-3">
            <a
              href="https://wa.me/+8801721106029"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="bg-green-500 p-2 rounded-[3px] text-center flex justify-center items-center gap-3 cursor-pointer">
                <MdSupportAgent className="text-white text-[20px]" />
                <span className="text-[13px]">24/7 Live Chat</span>
              </span>
            </a>
          </div>
          <div className="p-[10px]">
            <img className="w-full" src={banner} alt="" />
          </div>
          <div className="space-y-1 px-2 mt-[15px]">
            {categories.map((category, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded cursor-pointer hover:text-gray-500 text-gray-400 transition-colors duration-200 ${
                    activeMenu === category.name ? "" : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <img
                    src={`${API_BASE_URL}/${category.image}`}
                    alt={category.name}
                    className="w-5 h-5 min-w-[20px]"
                  />
                  <div className="flex items-center ml-3 w-full">
                    <span className="text-sm flex-grow whitespace-nowrap">
                      {category.name}
                    </span>
                    {activeMenu === category.name ? (
                      <FaChevronDown className="text-xs transition-transform duration-200" />
                    ) : (
                      <FaChevronRight className="text-xs transition-transform duration-200" />
                    )}
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeMenu === category.name ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  {activeMenu === category.name && (
                    <div className="ml-2 mt-1 mb-2">
                      {sidebarLoading ? (
                        <div className="p-4 text-center text-gray-400">
                          Loading...
                        </div>
                      ) : category.name.toLowerCase() === "exclusive" ? (
                        <div className="grid grid-cols-3 md:grid-cols-2 gap-2 p-2">
                          {exclusiveGames.map((game, gameIndex) => (
                            <div
                              key={gameIndex}
                              className="flex flex-col items-center rounded-[3px] transition-all cursor-pointer"
                              onClick={() => handleGameClick(game)}
                            >
                              <img
                                src={`${API_BASE_URL}/${
                                  game.landscapeImage || game.portraitImage
                                }`}
                                alt={game.name}
                                className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {providers.map((provider, providerIndex) => (
                            <div
                              key={providerIndex}
                              className="flex items-center p-2 rounded cursor-pointer hover:bg-[#333] transition-colors duration-200"
                              onClick={() => handleProviderClick(provider)}
                            >
                              <img
                                src={`${API_BASE_URL}/${provider.image}`}
                                alt={provider.name}
                                className="w-6 h-6 mr-2"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/24x24/222/fff?text=Provider";
                                }}
                              />
                              <span className="text-xs text-gray-400">
                                {provider.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#222424] my-4 mx-2"></div>
          <div className="px-2 mb-2">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm font-medium">Promotions</span>
              <NavLink
                to="/promotions"
                className="text-xs text-theme_color2 underline cursor-pointer"
              >
                View all
              </NavLink>
            </div>
            {activeMenu === "Promotions" && (
              <div className="flex overflow-x-auto space-x-4 p-2">
                {promotions.slice(0, 5).map((promotion) => (
                  <a
                    key={promotion._id.$oid}
                    href={promotion.targetUrl}
                    className="flex-shrink-0 w-48 bg-[#222424] overflow-hidden hover:bg-[#333] transition-colors duration-200"
                  >
                    <img
                      src={`${API_BASE_URL}/${promotion.image}`}
                      alt={promotion.title}
                      className="w-full h-24 object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1 px-2">
            {secondaryMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded text-gray-500 cursor-pointer hover:text-gray-600 transition-colors duration-200 ${
                    activeMenu === item.title ? "" : ""
                  }`}
                  onClick={() => toggleMenu(item.title)}
                >
                  {item.icon}
                  <div className="flex items-center ml-3 w-full">
                    <span className="text-sm flex-grow whitespace-nowrap">
                      {item.title}
                    </span>
                    {item.title !== "Promotions" &&
                      item.subItems.length > 0 &&
                      (activeMenu === item.title ? (
                        <FaChevronDown className="text-xs transition-transform duration-200" />
                      ) : (
                        <FaChevronRight className="text-xs transition-transform duration-200" />
                      ))}
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeMenu === item.title &&
                    item.title !== "Promotions" &&
                    item.subItems.length > 0
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  {activeMenu === item.title && item.title !== "Promotions" && (
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
          <div className="border-t border-[#222424] my-4 mx-2"></div>
          <div className="space-y-1 px-2">
            {bottomMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded text-gray-500 cursor-pointer hover:text-gray-600 transition-colors duration-200 ${
                    activeMenu === item.title ? "" : ""
                  }`}
                  onClick={() => toggleMenu(item.title)}
                >
                  {item.icon}
                  <div className="flex items-center ml-3 w-full">
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
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeMenu === item.title && item.subItems.length > 0
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  {activeMenu === item.title && item.subItems.length > 0 && (
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
          <div className="h-10"></div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] z-50">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex flex-col items-center cursor-pointer justify-center p-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <img src={menu_img} alt="Menu" className="h-6 w-6 mb-1" />
            <span>Menu</span>
          </button>
          <NavLink
            to="/casino"
            className="flex flex-col items-center justify-center p-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <img src={casino_img} alt="Casino" className="h-6 w-6 mb-1" />
            <span>Casino</span>
          </NavLink>
          <NavLink
            to="/slots"
            className="flex flex-col items-center justify-center p-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <img src={slot_img} alt="Slots" className="h-6 w-6 mb-1" />
            <span>Slots</span>
          </NavLink>
          {isLoggedIn ? (
            <NavLink
              to="/my-profile"
              className="flex flex-col items-center justify-center p-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <img src={profile_img} alt="Profile" className="h-6 w-6 mb-1" />
              <span>Profile</span>
            </NavLink>
          ) : (
            <NavLink
              to="/promotions"
              className="flex flex-col items-center justify-center p-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/favorite.png?v=1757670016214&source=drccdnsrc"
                alt="Promotions"
                className="h-6 w-6 mb-1"
              />
              <span>Promotions</span>
            </NavLink>
          )}
        </div>
      </div>
      {showSignupPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div
            ref={popupRef}
            className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-6 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowSignupPopup(false)}
              className="absolute -top-3 -right-3 bg-[#333] hover:bg-[#444] text-white cursor-pointer hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
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
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="#1a1a1a"
                    stroke="#00cc00"
                    strokeWidth="4"
                  />
                  <path
                    d="M25 30L27 32L35 24"
                    stroke="#00cc00"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-white text-center text-lg font-semibold mb-2">
              Sign up successfully
            </h2>
            <p className="text-gray-300 text-xs md:text-[15px] text-center mb-6">
              Your registration is complete and get ready for the thrill of the
              game! The world of sports betting is now at your fingertips. Best
              of luck on your bets!
            </p>
            <NavLink
              to="/deposit"
              onClick={() => setShowSignupPopup(false)}
              className="bg-theme_color text-center hover:bg-theme_color/90 text-[14px] text-white font-medium py-3 px-4 rounded-md transition-colors w-full block"
            >
              Deposit now
            </NavLink>
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
    </>
  );
};
