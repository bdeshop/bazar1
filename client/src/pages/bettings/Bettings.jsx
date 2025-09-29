import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiSliders } from "react-icons/fi";
import { FaFolderOpen } from "react-icons/fa";

const Bettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("settled");

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Area */}
       <div className="w-full overflow-y-auto">
 <div className="mx-auto w-full min-h-screen max-w-screen-xl md:px-4 py-4">
          {/* Top Section */}
          <div className="flex flex-col space-y-4 mb-4">
            {/* Title */}
            <h2 className="text-xl font-semibold">Betting records</h2>

            {/* Tabs */}
            <div className="flex items-center border-b border-gray-800">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "settled"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("settled")}
              >
                Settled
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "unsettled"
                    ? "border-b-2 border-green-500 text-white"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("unsettled")}
              >
                Unsettled
              </button>
              <div className="flex-grow " />
              <div className="flex items-center space-x-4 ml-auto">
                <button className="px-3 py-1.5 bg-[#2c2c2c] text-sm rounded-md hover:bg-[#3a3a3a] transition">
                  Last 7 days
                </button>
                <FiSliders className="text-lg cursor-pointer" />
              </div>
            </div>
          </div>

          {/* No Data Display */}
          <div className="flex flex-col items-center justify-center h-[calc(100%-150px)] text-center">
            <FaFolderOpen className="text-5xl text-theme_color mb-4" />
            <p className="text-gray-400">No data</p>
          </div>

    
        </div>
          <Footer />

       </div>
              {/* Footer */}
      </div>
    </div>
  );
};

export default Bettings;
