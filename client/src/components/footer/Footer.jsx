import React, { useState, useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaPinterest,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
  FaLinkedin,
  FaDiscord,
  FaReddit,
  FaMedium,
  FaGithub,
  FaSnapchat,
  FaWeixin,
  FaSkype,
} from "react-icons/fa";
import { SiTiktok, SiTelegram } from "react-icons/si";
import { IoOpenOutline } from "react-icons/io5";
import axios from "axios";
import logo from "../../assets/logo.png";
import OBP from "../../assets/OBP.png";

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);
  const [showMoreText, setShowMoreText] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchBrandingData();
    fetchSocialLinks();
  }, []);

  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branding`);
      if (response.data.success && response.data.data && response.data.data.logo) {
        const logoUrl = response.data.data.logo.startsWith('http') 
          ? response.data.data.logo 
          : `${API_BASE_URL}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
      setDynamicLogo(logo);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/social-links`);
      console.log(response);
      if (response.data.success) {
        setSocialLinks(response.data.data);
      } else {
        console.error("Failed to fetch social links");
        // Fallback to default social links if API fails
        setSocialLinks(getDefaultSocialLinks());
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      // Fallback to default social links if API fails
      setSocialLinks(getDefaultSocialLinks());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBrandingData();
    fetchSocialLinks();
  }, []);
  // Fallback default social links
  const getDefaultSocialLinks = () => {
    return [
      {
        platform: 'facebook',
        url: '#',
        displayName: 'Facebook',
        backgroundColor: '#1877F2',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'instagram',
        url: '#',
        displayName: 'Instagram',
        backgroundColor: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
        opensInNewTab: true,
        isGradient: true
      },
      {
        platform: 'twitter',
        url: '#',
        displayName: 'Twitter',
        backgroundColor: '#1DA1F2',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'youtube',
        url: '#',
        displayName: 'YouTube',
        backgroundColor: '#FF0000',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'pinterest',
        url: '#',
        displayName: 'Pinterest',
        backgroundColor: '#E60023',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'tiktok',
        url: '#',
        displayName: 'TikTok',
        backgroundColor: '#000000',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'telegram',
        url: '#',
        displayName: 'Telegram',
        backgroundColor: '#0088CC',
        opensInNewTab: true,
        isGradient: false
      },
      {
        platform: 'whatsapp',
        url: '#',
        displayName: 'WhatsApp',
        backgroundColor: '#25D366',
        opensInNewTab: true,
        isGradient: false
      }
    ];
  };

  const toggleSection = (section) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  const toggleShowMore = () => {
    setShowMoreText(!showMoreText);
  };

  // Function to get the appropriate icon for each platform
  const getSocialIcon = (platform) => {
    const iconProps = { size: 12, className: "text-white" };
    
    const icons = {
      facebook: <FaFacebook {...iconProps} />,
      instagram: <FaInstagram {...iconProps} />,
      twitter: <FaTwitter {...iconProps} />,
      youtube: <FaYoutube {...iconProps} />,
      pinterest: <FaPinterest {...iconProps} />,
      tiktok: <SiTiktok {...iconProps} />,
      telegram: <SiTelegram {...iconProps} />,
      whatsapp: <FaWhatsapp {...iconProps} />,
      linkedin: <FaLinkedin {...iconProps} />,
      discord: <FaDiscord {...iconProps} />,
      reddit: <FaReddit {...iconProps} />,
      medium: <FaMedium {...iconProps} />,
      github: <FaGithub {...iconProps} />,
      snapchat: <FaSnapchat {...iconProps} />,
      wechat: <FaWeixin {...iconProps} />,
      skype: <FaSkype {...iconProps} />
    };
    
    return icons[platform] || <FaFacebook {...iconProps} />;
  };

  return (
    <footer className="bg-[#141515] font-poppins text-gray-400 text-[10px] md:text-sm pb-[80px] md:pb-0 md:px-[50px]">
      <div className="mx-auto w-full max-w-screen-xl px-3 py-4 md:px-2 lg:px-4 md:py-8">
        {/* Mobile Dropdown Sections */}
        <div className="md:hidden mb-3">
          {/* Gaming Dropdown */}
          <div className="border-b border-gray-900 py-2">
            <button
              className="flex justify-between cursor-pointer items-center w-full text-left font-medium text-gray-200 text-[11px]"
              onClick={() => toggleSection("gaming")}
            >
              <span>Gaming</span>
              {openSection === "gaming" ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
            {openSection === "gaming" && (
              <ul className="mt-2 space-y-1 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    1xwin Casino
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Slots
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Table
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Fishing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Crash
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Arcade
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Lottery
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* About Boji Dropdown */}
          <div className="border-b border-gray-900 py-2">
            <button
              className="flex justify-between items-center cursor-pointer w-full text-left font-medium text-gray-200 text-[11px]"
              onClick={() => toggleSection("about")}
            >
              <span>About 1xwin</span>
              {openSection === "about" ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
            {openSection === "about" && (
              <ul className="mt-2 space-y-1 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    About Us
                    <span className="inline-block text-gray-500 text-[9px]">
                    <IoOpenOutline/>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Privacy Policy
                    <span className="inline-block text-gray-500 text-[9px]">
                      <IoOpenOutline/>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Terms & Conditions
                    <span className="inline-block text-gray-500 text-[9px]">
                        <IoOpenOutline/>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Responsible Gaming
                    <span className="inline-block text-gray-500 text-[9px]">
                        <IoOpenOutline/>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    KYC
                    <span className="inline-block text-gray-500 text-[9px]">
                    <IoOpenOutline/>     
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* Features Dropdown */}
          <div className="border-b border-gray-900 py-2">
            <button
              className="flex cursor-pointer justify-between items-center w-full text-left font-medium text-gray-200 text-[11px]"
              onClick={() => toggleSection("features")}
            >
              <span>Features</span>
              {openSection === "features" ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
            {openSection === "features" && (
              <ul className="mt-2 space-y-1 pl-2">
                <li>
                  <a
                    href="/promotions"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Promotions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    VIP Club
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Referral
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    Brand Ambassadors
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    APP Download
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* Help Dropdown */}
          <div className="border-b border-gray-900 py-2">
            <button
              className="flex cursor-pointer justify-between items-center w-full text-left font-medium text-white text-[11px]"
              onClick={() => toggleSection("help")}
            >
              <span>Help</span>
              {openSection === "help" ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              )}
            </button>
            {openSection === "help" && (
              <ul className="mt-2 space-y-1 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200 text-[10px]"
                  >
                    BJ Forum{" "}
                    <span className="inline-block text-gray-500 text-[9px]">
                      ↗
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Desktop Grid Layout (hidden on mobile) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Gaming */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">Gaming</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Casino
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Slots
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Table
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Fishing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Crash
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Arcade
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Lottery
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: About Boji */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">About Boji</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  About Us{" "}
                  <span className="inline-block text-gray-500 text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  Privacy Policy{" "}
                  <span className="inline-block text-gray-500 text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  Terms & Conditions{" "}
                  <span className="inline-block text-gray-500 text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  Responsible Gaming{" "}
                  <span className="inline-block text-gray-500 text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  KYC
                  <span className="inline-block text-gray-500 text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">Features</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/promotions"
                  className="hover:text-white transition-colors duration-200"
                >
                  Promotions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  VIP Club
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Referral
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Brand Ambassadors
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  APP Download
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Help */}
          <div>
            <h3 className="font-medium mb-4 text-white">Help</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
                >
                  BJ Forum
                  <span className="inline-block text-gray-500 text-xs ml-[2px] text-[20px]">      <IoOpenOutline/></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-4 md:my-8"></div>

        {/* Sponsorships Section */}
        <div className="mb-4 md:mb-8">
          <h3 className="font-medium mb-2 md:mb-4  text-gray-400 text-[11px] md:text-[16px]">
            Sponsorships
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4 items-center">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/afc-bournemouth.png?v=1754999737902&source=drccdnsrc"
                alt="AFC Bournemouth"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">AFC Bournemouth</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Official Partner
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/bologna-fc-1909.png?v=1754999737902&source=drccdnsrc"
                alt="Bologna FC"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Bologna FC 1909</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Official Club Sponsor
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/quetta-gladiators.png?v=1754999737902&source=drccdnsrc"
                alt="Quetta Gladiators"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Quetta Gladiators</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Main Sponsor
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/sunrisers-eastern-cape.png?v=1754999737902&source=drccdnsrc"
                alt="Sunrisers Eastern Cape"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Sunrisers Eastern Capo</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Main Sponsor
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/deccan-gladiators.png?v=1754999737902&source=drccdnsrc"
                alt="Deccan Gladiators"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Deccan Gladiators</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Official Partner
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/st-kitts-and-nevis-patriots.png?v=1754999737902&source=drccdnsrc"
                alt="St Kitts & Nevis Patriots"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">
                St Kitts & Nevis Patriots
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Principle Sponsor
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/biratnagar-kings.png?v=1754999737902&source=drccdnsrc"
                alt="Biratnagar Kings"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Biratnagar Kings</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                Back of Jersey Sponsor
              </p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-4 md:my-8"></div>

        {/* Brand Ambassadors Section */}
        <div className="mb-4 md:mb-8">
          <h3 className="flex items-center justify-start font-[400] mb-2 md:mb-4 text-gray-400 text-[11px] md:text-[16px]">
            Brand Ambassadors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4 items-center">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/mia-k.png?v=1754999737902&source=drccdnsrc"
                alt="Mia Khalifa"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Mia Khalifa</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2024 - 2028
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/kevin-pietersen.png?v=1754999737902&source=drccdnsrc"
                alt="Kevin Pietersen"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Kevin Pietersen</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2024 - 2028
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/amy-jacson.png?v=1754999737902&source=drccdnsrc"
                alt="Amy Jackson"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Amy Jackson</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/hansika.png?v=1754999737902&source=drccdnsrc"
                alt="Hansika Motwani"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Hansika Motwani</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/chan-samart.png?v=1754999737902&source=drccdnsrc"
                alt="Chan Samart"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Chan Samart</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/keya-akter-payel.png?v=1754999737902&source=drccdnsrc"
                alt="Keya Akter Payel"
                className="h-6 md:h-12 object-contain mb-1"
              />
              <p className="text-[9px] md:text-xs">Keya Akter Payel</p>
              <p className="text-[8px] md:text-xs text-gray-500">2025</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-4 md:my-8"></div>

        {/* Licenses and Responsible Gaming */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8 sm:justify-center sm:items-center">
          <div className="flex flex-col mb-3 md:mb-0 sm:w-full sm:order-first sm:flex-row-reverse">
            <div className="flex flex-col items-center mb-3 md:mb-0 sm:w-full sm:order-first">
              <h3 className="font-medium mb-2 md:mb-4 text-gray-400 text-[11px] md:text-[15px] sm:text-center">
                Gaming License
              </h3>
              <div className="flex space-x-2 md:space-x-4  sm:justify-center sm:items-center">
                <img
                  src="https://img.b112j.com/bj/h5/assets/images/footer/gaming_license.png?v=1754999737902&source=drccdnsrc"
                  alt="Gaming License"
                  className="h-5 md:h-7 object-contain sm:w-1/2 sm:mb-2"
                />
                <img
                  src="https://img.b112j.com/bj/h5/assets/images/footer/anjouan_license.png?v=1754999737902&source=drccdnsrc"
                  alt="Anjouan License"
                  className="h-5 md:h-7 object-contain sm:w-1/2 sm:mb-2"
                />
              </div>
            </div>
            <div className="flex flex-col items-center mt-3 md:mt-0 sm:w-full sm:order-last">
              <h3 className="font-medium mb-2 md:mb-4 text-gray-400 text-[11px] md:text-[15px] sm:text-center">
                Official Brand Partner
              </h3>
              <div className="flex items-center sm:w-full sm:justify-center">
                <img
                  src={OBP}
                  className="h-6 md:h-8 object-contain sm:w-full sm:mb-2"
                />
              </div>
            </div>
            <div className="flex items-center flex-col mt-3 md:mt-0">
              <h3 className="font-medium mb-2 md:mb-4 text-nowrap text-gray-400 text-[11px] md:text-[15px]">
                Responsible Gaming
              </h3>
              <div className="flex space-x-2 md:space-x-4 items-center">
                <img
                  alt="Regulations"
                  className="h-4 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/regulations.svg?v=1754999737902&source=drccdnsrc"
                />
                <img
                  alt="Gamcare"
                  className="h-4 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/gamcare.svg?v=1754999737902&source=drccdnsrc"
                />
                <img
                  alt="Age Limit"
                  className="h-4 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/age-limit.svg?v=1754999737902&source=drccdnsrc"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Text Section */}
        <div className="mb-4 md:mb-8">
          <h3 className="font-medium mb-2 text-gray-400 text-[11px] md:text-[15px]">
            1xwin Bangladesh - Leading Online Gaming and Betting Platform in
            Bangladesh
          </h3>
          <p className="text-justify leading-relaxed text-gray-600 text-[10px] md:text-[13px]">
            In recent years, the online gaming and betting industry in
            Bangladesh has seen exponential growth, attracting players who seek
            excitement and rewarding experiences. As more people embrace digital
            platforms, the demand for reliable and diverse gaming options has
            surged. Our platform stands out as a top choice, offering an
            extensive range of games and betting opportunities from renowned
            providers worldwide.
          </p>
          {showMoreText && (
            <p className="text-justify leading-relaxed text-gray-400 mt-2 text-[10px] md:text-base">
              With online betting becoming a mainstream entertainment choice,
              players are looking for a platform that offer both trust and
              variety. Among the most established names in the industry, 1xwin
              has built a reputation for excellence, security, and an
              unparalleled gaming experience. We continuously update our
              offerings to include the latest games and features, ensuring our
              users always have access to the best options available.
            </p>
          )}
          <button
            className="text-white text-[9px] px-2 py-1 mt-1 border border-gray-500 rounded-full hover:bg-gray-700 transition-colors duration-200"
            onClick={toggleShowMore}
          >
            {showMoreText ? "Show less" : "Show more"}
          </button>
        </div>

        {/* Copyright Section */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <img
                src={dynamicLogo}
                alt="logo"
                className="h-5 md:h-10 object-contain"
                onError={(e) => {
                  e.target.src = logo;
                }}
              />
              <div>
                <p className="text-[9px] text-gray-500 leading-none">
                  Win Like A King
                </p>
              </div>
            </div>
            
            {/* Dynamic Social Media Section */}
            <div className="mb-4 md:mb-0">
              <h3 className="font-medium mb-2 text-white text-[11px] md:text-sm text-center md:text-left">
                Follow Us
              </h3>
              {loading ? (
                <div className="flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 md:gap-2 justify-center md:justify-start">
                  {socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      className="p-2 rounded-full hover:opacity-90 transition-opacity duration-200 flex items-center justify-center"
                      style={{ 
                        background: link.backgroundColor,
                        backgroundImage: link.isGradient ? link.backgroundColor : 'none'
                      }}
                      aria-label={link.displayName}
                      target={link.opensInNewTab ? "_blank" : "_self"}
                      rel={link.opensInNewTab ? "noopener noreferrer" : ""}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[9px] text-gray-500 mt-2 text-justify">
            1xwin.live is owned and operated by BAJI Holdings Limited,
            registration number 15839, registered address: Hamshahaka,
            Mutasammudu, Autonomous Island of Anjouan, Union of Comoros. Contact
            us{" "}
            <a
              href="mailto:bill@holdingsltd.com"
              className="text-blue-400 hover:underline"
            >
              support@1xwin.live
            </a>
            . 1xwin.live is licensed and regulated by the Government of the
            Autonomous Island of Anjouan, Union of Comoros and operates under
            License No. ALSB-202410030-FJL. 1xwin.live has passed all regulatory
            compliance and is legally authorized to conduct gaming operations
            for any and all games of chance and wagering.
          </p>
        </div>
        <p className="text-[9px] text-white mt-2 text-center md:text-500">
          &copy; 2025 1xwin Copyrights. All rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;