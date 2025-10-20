import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import logo from "../assets/logo.png";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import toast,{Toaster} from "react-hot-toast"
const Header = ({ toggleSidebar }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
const navigate = useNavigate();
// -------------------logout-funtion---------------------
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove localStorage data
        localStorage.removeItem('loanadmin');
        localStorage.removeItem('loantoken');

        // Optional: show a success message
        toast.success("You have been logged out.");

        // Redirect to /admin-login after a short delay
        setTimeout(() => {
          navigate("/ogin");
        }, 1000);
      }
    });
  };

  return (
    <header className='w-full h-[9vh] bg-gray-900 fixed top-0 left-0 z-[1000] px-[20px] font-nunito py-[10px] flex justify-between items-center shadow-sm border-gray-200'>
     <Toaster/>
      {/* Left Side Logo + Menu */}
      <div className="logo flex justify-start items-center gap-[20px] w-full">
        <NavLink to="/dashboard" className='md:flex justify-start items-center gap-[5px] hidden md:w-[12%]'>
          <img className='w-[50%] ' src={logo} alt="logo" />
        </NavLink>
        <div className="menu text-[25px] cursor-pointer text-white" onClick={toggleSidebar}>
          <HiOutlineMenuAlt2 />
        </div>
      </div>

      {/* Right Side - Settings & Admin */}
      <div className="relative flex items-center gap-4" ref={dropdownRef}>
        <button className="text-[22px] text-white hover:text-[#0A92FA] transition duration-200">
          <FiSettings />
        </button>

    

      </div>
    </header>
  );
};

export default Header;
