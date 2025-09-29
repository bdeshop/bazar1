import React, { useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaFolderOpen } from "react-icons/fa"; // No-data icon

const Turnover = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Area */}
        <div className="w-full">
<div className="mx-auto min-h-screen overflow-y-auto w-full max-w-screen-xl md:px-4 py-4">
          {/* Title */}
          <h2 className="text-xl font-semibold mb-4">Turnover</h2>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-700 mb-6">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "active"
                  ? "border-b-2 border-green-500 text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-green-500 text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
            <div className="flex-grow " />
          </div>

          {/* No Data Display */}
          <div className="flex flex-col items-center justify-center h-[calc(100%-150px)] text-center">
            <FaFolderOpen className="text-5xl text-green-500 mb-4" />
            <p className="text-gray-400">No data</p>
          </div>

          {/* Footer */}
        </div>
          <Footer />

        </div>
      </div>
    </div>
  );
};

export default Turnover;
