import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { FaRegFileImage } from "react-icons/fa6";
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfirmationPopup from "../../components/modal/ConfirmationPopup"

const Security = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
  
        </main>
      </div>

    </section>
  );
};

export default Security;