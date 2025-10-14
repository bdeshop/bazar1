// App.js
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import { Slider } from "../../components/home_componets/Slider";
import Footer from "../../components/footer/Footer";
import { AiOutlineSound } from "react-icons/ai";
import Category from "../../components/home_componets/category/Categroy";
import ProviderSlider from "../../components/home_componets/provider/ProviderSlider";
import Event from "../../components/home_componets/event/Event";
import Featured from "../../components/home_componets/featured/Featured";
import logo from "../../assets/logo.png";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Provider data with image URLs
  const providers = [
    {
      name: "Every",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmsexy.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "JL",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmjili.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "JIU",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmjili.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "EVO",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-evo.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "JD",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-jdb.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "JDB",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-jdb.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "FC",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmfc.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "FG Chat",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmyesbingo.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Yellow Bot",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/vendor-type/for-dark/vendor-awcmyesbingo.png?v=1754999737902&source=drccdnsrc",
    },
  ];

  // Events data
  const events = [
    {
      name: "HUNDRED",
      image: "https://img.b112j.com/upload/announcement/image_247589.jpg",
      time: "23:30",
      date: "19 AUG 2025 (TUE)",
    },
    {
      name: "PATRICTS",
      image: "https://img.b112j.com/upload/announcement/image_247687.jpg",
      time: "05:00",
      date: "20 AUG 2025 (WED)",
    },
    {
      name: "HUNDRED",
      image: "https://img.b112j.com/upload/announcement/image_247589.jpg",
      time: "20:00",
      date: "20 AUG 2025 (WED)",
    },
  ];

  // Featured games data
  const featuredGames = [
    {
      name: "MAGIC ACE",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-super-elements.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "WILD LOCK",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-money-wheel.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "PIGGY BANK",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-divas-ace.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "FRUITY BONANZA",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-golden-genie.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "SUGAR BANG BANG 2",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-the-kings-ace.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "OUTES OF QIYMPUS",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-super-elements.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "SUPER BANK",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-money-wheel.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "SWEET BOX AND SPOT DOWN",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-divas-ace.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "SUPER ACE",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-golden-genie.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "BOX IN KINI",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-the-kings-ace.png?v=1754999737902&source=drccdnsrc",
    },
  ];

  // Exclusive categories data
  const exclusiveCategories = [
    {
      name: "Sports",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-sport.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Casino",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-casino.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Slots",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-slot.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Table",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-table.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Fishing",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-fish.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Crash",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-crash.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Arcade",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-arcade.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Lottery",
      image:
        "https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/inactive/icon-lottery.png?v=1754999737902&source=drccdnsrc",
    },
  ];

  // Effects games data
  const effectsGames = [
    {
      name: "Super",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-super-elements.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Flaments",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-money-wheel.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "BLOODY",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-fortune-gems.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "WATER",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-divas-ace.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "Parmin Grims",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-golden-genie.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "DIVAS AGB",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-the-kings-ace.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "GOLDEN",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-super-elements.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "GEKLE",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-money-wheel.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "THERINGS",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-fortune-gems.png?v=1754999737902&source=drccdnsrc",
    },
    {
      name: "ACB",
      image:
        "https://img.b112j.com/bj/h5/assets/images/exclusivegames/default/exclusive-divas-ace.png?v=1754999737902&source=drccdnsrc",
    },
  ];

  // Use useEffect to handle the actual loading state
  useEffect(() => {
    // Set isLoading to false when all critical resources are loaded
    const handleLoad = () => {
      setIsLoading(false);
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handleLoad);

      // Also set a fallback in case the load event doesn't fire
      // This ensures the loader doesn't stay forever
      const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 seconds maximum

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-[10000000]">
          <div className="relative w-24 h-24 flex justify-center items-center">
            {/* Outer rotating circle */}
            <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>

            {/* Inner logo */}
            <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
              <img className="w-16" src={logo} alt="Loading..." />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-auto transition-all duration-300 ${
            isLoading ? "opacity-50" : ""
          }`}
        >
          <div className="">
            <Slider />
            <main className="mx-auto w-full max-w-screen-xl md:px-4 py-2 md:py-4">
              {/* Pear Customers Notice */}
              <div className="p-2 md:p-4 text-black flex items-center justify-between">
                <AiOutlineSound className="text-xl text-theme_color mr-2" />
                <marquee
                  behavior="scroll"
                  scrollamount="10"
                  direction="left"
                  className="text-[12px] md:text-[14px] text-white flex-1 font-[400]"
                >
                  Welcome to 1xwin.live Bangladesh Best Casino Platform in 2025
                  Deposit 100% Bonuses on 1xwin.live
                </marquee>
              </div>

              {/* Exclusive Categories Section */}
              <Category />

              {/* Providers Section */}
              <ProviderSlider />

              {/* Events Section */}
              <Event />

              {/* Featured Games Section */}
              <Featured />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
