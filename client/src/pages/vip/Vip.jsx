import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaCircle } from "react-icons/fa";

const Vip = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#151515] text-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

      <div className="w-full">
       <div className="mx-auto w-full min-h-screen overflow-y-auto max-w-screen-lg md:px-4 py-4">
          {/* Content Container */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Left Section */}
            <div className="w-full lg:w-1/2 space-y-4">
              {/* Title */}
              <h2 className="text-xl font-semibold">My VIP</h2>

              {/* Points */}
              <div>
                <p className="text-sm font-medium text-gray-400">VIP Points (VP)</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                  <span className="text-green-400">0</span>
                  <span>/ 80000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }} />
                </div>
              </div>

              {/* Levels */}
              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex items-center space-x-2">
                  <FaCircle className="text-green-400 text-xs" />
                  <span className="bg-gray-800 px-2 py-1 rounded-md text-xs">Normal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCircle className="text-yellow-400 text-xs" />
                  <span className="text-gray-400 text-xs">Elite I</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 space-y-3">
                <button className="w-full bg-theme_color cursor-pointer text-white font-semibold py-3 rounded-md transition">
                  VIP Instant rebate
                </button>
                <button className="w-full border border-gray-600 cursor-pointer hover:bg-gray-800 text-gray-200 font-medium py-3 rounded-md transition">
                  Upgrade history
                </button>
              </div>
            </div>

            {/* Right Section: VIP Animation */}
            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <video
                src="https://bajilive.net/assets/v3/images/vip/vip-visual/vip-01-rank1.webm"
                autoPlay
                loop
                muted
                playsInline
                className="max-w-[300px] lg:max-w-[350px] h-auto"
              />
            </div>
          </div>

        </div>
          <Footer />

      </div>
      </div>
    </div>
  );
};

export default Vip;
