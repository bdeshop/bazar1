import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaPinterest,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { SiTiktok, SiTelegram } from "react-icons/si";
import logo from "../../assets/logo.png";
import OBP from "../../assets/OBP.png";

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);
  const [showMoreText, setShowMoreText] = useState(false);

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

  return (
    <footer className="bg-[#0e0e0e] font-poppins text-gray-400 text-xs md:text-sm pb-[80px] md:pb-0 md:px-[50px]">
      <div className="container mx-auto px-3 py-6 md:px-4 md:py-8">
        {/* Mobile Dropdown Sections */}
        <div className="md:hidden mb-4">
          {/* Gaming Dropdown */}
          <div className="border-b border-gray-900 py-3">
            <button
              className="flex justify-between cursor-pointer items-center w-full text-left font-medium text-gray-200 text-sm"
              onClick={() => toggleSection("gaming")}
            >
              <span>Gaming</span>
              {openSection === "gaming" ? (
                <FaChevronUp size={14} />
              ) : (
                <FaChevronDown size={14} />
              )}
            </button>
            {openSection === "gaming" && (
              <ul className="mt-3 space-y-2 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    1xwin Casino
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
            )}
          </div>

          {/* About Boji Dropdown */}
          <div className="border-b border-gray-900 py-3">
            <button
              className="flex justify-between items-center cursor-pointer w-full text-left font-medium text-gray-200 text-sm"
              onClick={() => toggleSection("about")}
            >
              <span>About 1xwin</span>
              {openSection === "about" ? (
                <FaChevronUp size={14} />
              ) : (
                <FaChevronDown size={14} />
              )}
            </button>
            {openSection === "about" && (
              <ul className="mt-3 space-y-2 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    About Us{" "}
                    <span className="inline-block text-gray-500 text-xs">
                      ↗
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy{" "}
                    <span className="inline-block text-gray-500 text-xs">
                      ↗
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Terms & Conditions{" "}
                    <span className="inline-block text-gray-500 text-xs">
                      ↗
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Responsible Gaming{" "}
                    <span className="inline-block text-gray-500 text-xs">
                      ↗
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    KYC{" "}
                    <span className="inline-block text-gray-500 text-xs">
                      ↗
                    </span>
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* Features Dropdown */}
          <div className="border-b border-gray-900 py-3">
            <button
              className="flex cursor-pointer justify-between items-center w-full text-left font-medium text-gray-200 text-sm"
              onClick={() => toggleSection("features")}
            >
              <span>Features</span>
              {openSection === "features" ? (
                <FaChevronUp size={14} />
              ) : (
                <FaChevronDown size={14} />
              )}
            </button>
            {openSection === "features" && (
              <ul className="mt-3 space-y-2 pl-2">
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
            )}
          </div>

          {/* Help Dropdown */}
          <div className="border-b border-gray-900 py-3">
            <button
              className="flex cursor-pointer justify-between items-center w-full text-left font-medium text-white text-sm"
              onClick={() => toggleSection("help")}
            >
              <span>Help</span>
              {openSection === "help" ? (
                <FaChevronUp size={14} />
              ) : (
                <FaChevronDown size={14} />
              )}
            </button>
            {openSection === "help" && (
              <ul className="mt-3 space-y-2 pl-2">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors duration-200"
                  >
                    BJ Forum{" "}
                    <span className="inline-block text-gray-500 text-xs">
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
                  className="hover:text-white transition-colors duration-200"
                >
                  About Us{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms & Conditions{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Responsible Gaming{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  KYC{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
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
                  className="hover:text-white transition-colors duration-200"
                >
                  BJ Forum{" "}
                  <span className="inline-block text-gray-500 text-xs">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-6 md:my-8"></div>

        {/* Sponsorships Section */}
        <div className="mb-6 md:mb-8">
          <h3 className="font-medium mb-3 md:mb-4 text-center text-white text-xs md:text-lg">
            Sponsorships
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 items-center">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/afc-bournemouth.png?v=1754999737902&source=drccdnsrc"
                alt="AFC Bournemouth"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">AFC Bournemouth</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Official Partner
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/bologna-fc-1909.png?v=1754999737902&source=drccdnsrc"
                alt="Bologna FC"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Bologna FC 1909</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Official Club Sponsor
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/quetta-gladiators.png?v=1754999737902&source=drccdnsrc"
                alt="Quetta Gladiators"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Quetta Gladiators</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Main Sponsor
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/sunrisers-eastern-cape.png?v=1754999737902&source=drccdnsrc"
                alt="Sunrisers Eastern Cape"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Sunrisers Eastern Capo</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Main Sponsor
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/deccan-gladiators.png?v=1754999737902&source=drccdnsrc"
                alt="Deccan Gladiators"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Deccan Gladiators</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Official Partner
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/st-kitts-and-nevis-patriots.png?v=1754999737902&source=drccdnsrc"
                alt="St Kitts & Nevis Patriots"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">
                St Kitts & Nevis Patriots
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Principle Sponsor
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/sponsor/biratnagar-kings.png?v=1754999737902&source=drccdnsrc"
                alt="Biratnagar Kings"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Biratnagar Kings</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                Back of Jersey Sponsor
              </p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-6 md:my-8"></div>

        {/* Brand Ambassadors Section */}
        <div className="mb-6 md:mb-8">
          <h3 className="flex items-center justify-center font-medium mb-3 md:mb-4 text-white text-xs md:text-lg">
            Brand Ambassadors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 items-center">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/mia-k.png?v=1754999737902&source=drccdnsrc"
                alt="Mia Khalifa"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Mia Khalifa</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2024 - 2028
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/kevin-pietersen.png?v=1754999737902&source=drccdnsrc"
                alt="Kevin Pietersen"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Kevin Pietersen</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2024 - 2028
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/amy-jacson.png?v=1754999737902&source=drccdnsrc"
                alt="Amy Jackson"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Amy Jackson</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/hansika.png?v=1754999737902&source=drccdnsrc"
                alt="Hansika Motwani"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Hansika Motwani</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2023 - 2024
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/chan-samart.png?v=1754999737902&source=drccdnsrc"
                alt="Chan Samart"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Chan Samart</p>
              <p className="text-[10px] md:text-xs text-gray-500">
                2024 - 2025
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <img
                src="https://img.b112j.com/bj/h5/assets/v3/images/ambassador/keya-akter-payel.png?v=1754999737902&source=drccdnsrc"
                alt="Keya Akter Payel"
                className="h-8 md:h-12 object-contain mb-1 md:mb-2"
              />
              <p className="text-[10px] md:text-xs">Keya Akter Payel</p>
              <p className="text-[10px] md:text-xs text-gray-500">2025</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-700 my-6 md:my-8"></div>

        {/* Licenses and Responsible Gaming */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 sm:justify-center sm:items-center">
          <div className="flex flex-col mb-4 md:mb-0 sm:w-full sm:order-first sm:flex-row-reverse">
            <div className="flex flex-col items-center mb-4 md:mb-0 sm:w-full sm:order-first">
              <h3 className="font-medium mb-3 md:mb-4 text-white text-xs md:text-lg sm:text-center">
                Gaming License
              </h3>
              <div className="flex space-x-3 md:space-x-4 sm:flex-wrap sm:justify-center sm:items-center">
                <img
                  src="https://img.b112j.com/bj/h5/assets/images/footer/gaming_license.png?v=1754999737902&source=drccdnsrc"
                  alt="Gaming License"
                  className="h-6 md:h-10 object-contain sm:w-1/2 sm:mb-2"
                />
                <img
                  src="https://img.b112j.com/bj/h5/assets/images/footer/anjouan_license.png?v=1754999737902&source=drccdnsrc"
                  alt="Anjouan License"
                  className="h-6 md:h-10 object-contain sm:w-1/2 sm:mb-2"
                />
              </div>
            </div>
            <div className="flex flex-col items-center mt-4 md:mt-0 sm:w-full sm:order-last">
              <h3 className="font-medium mb-3 md:mb-4 text-white text-xs md:text-lg sm:text-center">
                Official Brand Partner
              </h3>
              <div className="flex items-center sm:w-full sm:justify-center">
                <img
                  src={OBP}
                  className="h-8 md:h-12 object-contain sm:w-full sm:mb-2"
                />
              </div>
            </div>
            <div className="flex items-center flex-col mt-4 md:mt-0">
              <h3 className="font-medium mb-3 md:mb-4 text-white text-xs md:text-lg">
                Responsible Gaming
              </h3>
              <div className="flex space-x-3 md:space-x-4 items-center">
                <img
                  alt="Regulations"
                  className="h-5 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/regulations.svg?v=1754999737902&source=drccdnsrc"
                />
                <img
                  alt="Gamcare"
                  className="h-5 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/gamcare.svg?v=1754999737902&source=drccdnsrc"
                />
                <img
                  alt="Age Limit"
                  className="h-5 md:h-8"
                  src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/age-limit.svg?v=1754999737902&source=drccdnsrc"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Text Section */}
        <div className="mb-6 md:mb-8">
          <h3 className="font-medium mb-2 text-white text-xs md:text-lg">
            1xwin Bangladesh - Leading Online Gaming and Betting Platform in
            Bangladesh
          </h3>
          <p className="text-justify leading-relaxed text-gray-400 text-xs md:text-base">
            In recent years, the online gaming and betting industry in
            Bangladesh has seen exponential growth, attracting players who seek
            excitement and rewarding experiences. As more people embrace digital
            platforms, the demand for reliable and diverse gaming options has
            surged. Our platform stands out as a top choice, offering an
            extensive range of games and betting opportunities from renowned
            providers worldwide.
          </p>
          {showMoreText && (
            <p className="text-justify leading-relaxed text-gray-400 mt-3 text-xs md:text-base">
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
            className="text-white text-[10px] px-2 py-1 mt-2 border border-gray-500 rounded-full hover:bg-gray-700 transition-colors duration-200"
            onClick={toggleShowMore}
          >
            {showMoreText ? "Show less" : "Show more"}
          </button>
        </div>

        {/* Copyright Section */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex items-center space-x-2 mb-3 md:mb-0">
              <img
                src={logo}
                alt="logo"
                className="h-6 md:h-10 object-contain"
              />
              <div>
                <p className="text-[10px] text-gray-500 leading-none">
                  Win Like A King
                </p>
              </div>
            </div>
            {/* Social Media Section */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-wrap gap-2 md:gap-3">
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaFacebook size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-pink-600 transition-colors duration-200"
                >
                  <FaInstagram size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-blue-400 transition-colors duration-200"
                >
                  <FaTwitter size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <FaYoutube size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-red-500 transition-colors duration-200"
                >
                  <FaPinterest size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-blue-500 transition-colors duration-200"
                >
                  <SiTiktok size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-blue-500 transition-colors duration-200"
                >
                  <SiTelegram size={12} className="text-white" />
                </a>
                <a
                  href="#"
                  className="p-1.5 md:p-2 bg-gray-700 rounded-full hover:bg-green-500 transition-colors duration-200"
                >
                  <FaWhatsapp size={12} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mt-3 text-justify">
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
        <p className="text-[10px] text-white mt-3 text-center md:text-500">
          &copy; 2025 1xwin Copyrights. All rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
