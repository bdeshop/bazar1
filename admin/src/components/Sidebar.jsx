import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiChevronRight, 
  FiHome, 
  FiDollarSign, 
  FiUsers, 
  FiSettings,
  FiPieChart,
  FiBell,
  FiShield,
  FiActivity,
  FiTrendingUp,
  FiAward,
  FiUserCheck,
  FiBarChart2,
  FiDatabase,
  FiLayers,
  FiCreditCard,
  FiBook,
  FiCalendar,
  FiList,
  FiBox,
  FiMessageSquare,
  FiSliders,
  FiLogIn,
  FiServer,
  FiGlobe,
  FiFileText,
  FiBookOpen
} from 'react-icons/fi';
import { 
  MdSportsScore, 
  MdCasino, 
  MdLiveTv,
  MdSecurity,
  MdOutlinePayments,
} from 'react-icons/md';
import { RiCoinsLine, RiCouponLine, RiRefund2Line } from 'react-icons/ri';
import { TbTournament } from 'react-icons/tb';
import {useNavigate} from "react-router-dom"

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [notifications, setNotifications] = useState(5); // Example notification count
  const navigate=useNavigate();
  
  const logout=()=>{
    localStorage.removeItem("admin");
    localStorage.removeItem("admintoken");
    navigate("/login");
  };

  useEffect(() => {
    // Set active menu based on current path
    const path = location.pathname;
    if (path.startsWith('/dashboard/sports')) setOpenMenu('sports');
    else if (path.startsWith('/dashboard/betting')) setOpenMenu('betting');
    else if (path.startsWith('/content')) setOpenMenu('content');
    else if (path.startsWith('/dashboard/bonuses')) setOpenMenu('bonuses');
    else if (path.startsWith('/dashboard/finance')) setOpenMenu('finance');
    else if (path.startsWith('/users')) setOpenMenu('users');
    else if (path.startsWith('/dashboard/security')) setOpenMenu('security');
    else if (path.startsWith('/dashboard/reports')) setOpenMenu('reports');
    else if (path.startsWith('/withdraw')) setOpenMenu('withdraw');
    else if (path.startsWith('/deposit')) setOpenMenu('deposit');
    else if (path.startsWith('/bet-logs')) setOpenMenu('betLogs');
    else if (path.startsWith('/games-management')) setOpenMenu('games');
    else if (path.startsWith('/notifications')) setOpenMenu('notifications');
    else if (path.startsWith('/affiliate')) setOpenMenu('affiliate');
    else if (path.startsWith('/login-logs')) setOpenMenu('loginLogs');
    else if (path.startsWith('/system')) setOpenMenu('system');
    else if (path.startsWith('/reports')) setOpenMenu('reports');
    else if (path.startsWith('/bonus')) setOpenMenu('bonus');
  }, [location]);

  const handleToggle = (menu) => {
    setOpenMenu(prev => (prev === menu ? null : menu));
  };

  return (
    <aside
      className={`transition-all no-scrollbar duration-300 fixed w-[70%] md:w-[40%] lg:w-[28%] xl:w-[17%] h-full z-[999] border-r border-orange-800 text-sm shadow-2xl pt-[12vh] p-4 ${
        isOpen ? 'left-0 top-0' : 'left-[-120%] top-0'
      } bg-[#101828] text-white`}
    >
      {/* Admin Header */}
      <div className="flex items-center justify-between mb-6 p-3 rounded-lg border border-orange-800/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-theme_color flex items-center justify-center mr-3">
            <span className="font-bold text-xs">AD</span>
          </div>
          <div>
            <p className="font-medium text-sm">Admin User</p>
            <p className="text-xs text-orange-400">Super Admin</p>
          </div>
        </div>
        <div className="relative">
          <FiBell className="text-xl text-orange-200 hover:text-orange-400 transition-colors duration-200" />
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center justify-between w-full px-3 py-2.5 text-[15px] lg:text-[16px] cursor-pointer rounded-lg transition-all duration-300 group ${
              isActive
                ? 'bg-orange-700 text-white font-semibold shadow-lg shadow-orange-900/30'
                : 'hover:bg-orange-800/40 hover:text-white text-orange-400 hover:translate-x-1'
            }`
          }
        >
          <span className="flex items-center gap-3">
            <FiHome className="text-[18px] group-hover:scale-110 transition-transform duration-300" />
            Dashboard
          </span>
        </NavLink>
      </div>

      {/* Sidebar Menus */}
      {[
        {
          label: 'Games Management',
          icon: <FiBox className="text-[18px]" />,
          key: 'games',
          links: [
            { to: '/games-management/new-game', text: 'New Game' },
            { to: '/games-management/all-games', text: 'All Games' },
            { to: '/games-management/active-games', text: 'Active Games' },
            { to: '/games-management/deactive-games', text: 'Deactive Games' },
            { to: '/games-management/game-categories', text: 'Game Categories' },
            { to: '/games-management/game-providers', text: 'Game Providers' },
          ],
        },
        {
          label: 'Bet Logs',
          icon: <FiActivity className="text-[18px]" />,
          key: 'betLogs',
          links: [
            { to: '/bet-logs/bet-logs', text: 'All Bets' },
            { to: '/bet-logs/hight-stakes-bet-logs', text: 'High Stakes Bets' },
          ],
        },
        {
          label: 'User Management',
          icon: <FiUsers className="text-[18px]" />,
          key: 'users',
          links: [
            { to: '/users/all-users', text: 'All Users' },
            { to: '/users/active-users', text: 'Active Users' },
            { to: '/users/inactive-users', text: 'Inactive Users' },
            { to: '/users/restricted-users', text: 'Restricted Users' },
            { to: '/users/vip-users', text: 'VIP Users' },
          ],
        },
        {
          label: 'Deposit Management',
          icon: <RiCoinsLine className="text-[18px]" />,
          key: 'deposit',
          links: [
            { to: '/deposit/pending', text: 'Pending Deposits' },
            { to: '/deposit/approved', text: 'Approved Deposits' },
            { to: '/deposit/rejected', text: 'Rejected Deposits' },
            { to: '/deposit/history', text: 'Deposit History' },
            { to: '/deposit/payment-methods', text: 'Payment Methods' },
          ],
        },
        {
          label: 'Withdrawal Management',
          icon: <RiRefund2Line className="text-[18px]" />,
          key: 'withdraw',
          links: [
            { to: '/withdraw/pending', text: 'Pending Withdrawals' },
            { to: '/withdraw/approved', text: 'Approved Withdrawals' },
            { to: '/withdraw/rejected', text: 'Rejected Withdrawals' },
            { to: '/withdraw/history', text: 'Withdraw History' },
            { to: '/withdraw/limits', text: 'Withdrawal Limits' },
          ],
        },
         {
          label: 'Event Management',
          icon: <FiCalendar className="text-[18px]" />,
          key: 'event',
          links: [
            { to: '/event-management/create-event', text: 'Create Event' },
            { to: '/event-management/all-events', text: 'All Events' },
          ],
        },
        {
          label: 'Affiliate Management',
          icon: <FiTrendingUp className="text-[18px]" />,
          key: 'affiliate',
          links: [
            { to: '/affiliate/affiliates', text: 'All Affiliates' },
            { to: '/affiliate/commission-structure', text: 'Commission Structure' },
            { to: '/affiliate/payouts', text: 'Payouts' },
            { to: '/affiliate/referrals', text: 'Referral Tracking' },
            { to: '/affiliate/performance', text: 'Performance Reports' },
            { to: '/affiliate/marketing-materials', text: 'Marketing Materials' },
          ],
        },
        // {
        //   label: 'Bonus & Promotions',
        //   icon: <FiAward className="text-[18px]" />,
        //   key: 'bonus',
        //   links: [
        //     { to: '/bonus/create-bonus', text: 'Create Bonus' },
        //     { to: '/bonus/all-bonuses', text: 'All Bonuses' },
        //     { to: '/bonus/active-bonuses', text: 'Active Bonuses' },
        //     { to: '/bonus/bonus-templates', text: 'Bonus Templates' },
        //     { to: '/bonus/wagering-requirements', text: 'Wagering Requirements' },
        //   ],
        // },
        {
          label: 'Login Logs & Security',
          icon: <FiLogIn className="text-[18px]" />,
          key: 'loginLogs',
          links: [
            { to: '/login-logs/all-logs', text: 'All Login Logs' },
            { to: '/login-logs/failed-logins', text: 'Failed Login Attempts' },
            { to: '/login-logs/ip-whitelist', text: 'IP Whitelist' },
            { to: '/login-logs/device-management', text: 'Device Management' },
            { to: '/login-logs/security-settings', text: 'Security Settings' },
          ],
        },
        {
          label: 'Content Management',
          icon: <FiLayers className="text-[18px]" />,
          key: 'content',
          links: [
            { to: '/content/banner-and-sliders', text: 'Banners & Sliders' },
            { to: '/content/promotional-content', text: 'Promotional Content' },
            { to: '/content/terms-and-conditions', text: 'Terms & Conditions' },
            { to: '/content/faq', text: 'FAQ Management' },
            { to: '/content/logo-and-favicon', text: 'Logo And Favicon' },
          ],
        },
        {
          label: 'Notification Management',
          icon: <FiBell className="text-[18px]" />,
          key: 'notifications',
          links: [
            { to: '/notifications/send-notification', text: 'Send Notification' },
            { to: '/notifications/all-notifications', text: 'All Notifications' },
          ],
        },
        // {
        //   label: 'Reports & Analytics',
        //   icon: <FiBarChart2 className="text-[18px]" />,
        //   key: 'reports',
        //   links: [
        //     { to: '/reports/financial-reports', text: 'Financial Reports' },
        //     { to: '/reports/user-activity', text: 'User Activity Reports' },
        //     { to: '/reports/game-performance', text: 'Game Performance' },
        //     { to: '/reports/affiliate-reports', text: 'Affiliate Reports' },
        //     { to: '/reports/custom-reports', text: 'Custom Reports' },
        //   ],
        // },
        // {
        //   label: 'System Settings',
        //   icon: <FiServer className="text-[18px]" />,
        //   key: 'system',
        //   links: [
        //     { to: '/system/general-settings', text: 'General Settings' },
        //     { to: '/system/payment-settings', text: 'Payment Settings' },
        //     { to: '/system/currency-management', text: 'Currency Management' },
        //     { to: '/system/language-settings', text: 'Language Settings' },
        //     { to: '/system/maintenance-mode', text: 'Maintenance Mode' },
        //     { to: '/system/backup-restore', text: 'Backup & Restore' },
        //   ],
        // },
      ].map(({ label, icon, key, links }) => (
        <div key={key} className="mb-2">
          <div
            onClick={() => handleToggle(key)}
            className={`flex items-center justify-between w-full px-3 py-2.5 text-[13px] md:text-[14px] lg:text-[14px] xl:text-[13px] 2xl:text-[15px] text-nowrap cursor-pointer rounded-lg transition-all duration-300 group ${
              openMenu === key
                ? 'bg-orange-700 text-white font-semibold shadow-lg shadow-orange-900/30'
                : 'text-orange-200 hover:bg-orange-800/40 hover:text-white hover:translate-x-1'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="group-hover:scale-110 transition-transform duration-300">
                {icon}
              </span>
              {label}
            </span>
            <FiChevronRight
              className={`transition-all duration-300 ${
                openMenu === key ? 'rotate-90' : ''
              } group-hover:scale-110`}
            />
          </div>
          <div
            className={`ml-4 overflow-hidden transition-all duration-500 ${
              openMenu === key ? 'max-h-96' : 'max-h-0'
            }`}
          >
            {links.map(({ to, text }) => (
              <NavLink
                key={text}
                to={to}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 text-sm rounded-md mt-1 transition-all duration-300 group ${
                    isActive 
                      ? 'text-orange-400 font-medium ' 
                      : 'text-orange-200/80 hover:text-orange-500'
                  }`
                }
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-3 group-hover:scale-125 transition-transform duration-300"></div>
                {text}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      {/* Support Section */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <NavLink
          to="/dashboard/support"
          className={({ isActive }) =>
            `flex items-center w-full px-3 py-2.5 text-[15px] lg:text-[16px] cursor-pointer rounded-lg transition-all duration-300 mb-2 group ${
              isActive
                ? 'bg-orange-800/40 text-white font-semibold'
                : 'text-orange-200 hover:bg-orange-800/40 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="flex items-center gap-3">
            <FiMessageSquare className="text-[18px] group-hover:scale-110 transition-transform duration-300" />
            Support Tickets
          </span>
        </NavLink>
        
        {/* Logout Button */}
        <button onClick={logout} className="flex items-center w-full px-3 py-2.5 text-[15px] lg:text-[16px] cursor-pointer rounded-lg transition-all duration-300 text-orange-200 hover:bg-orange-800/40 hover:text-white hover:translate-x-1 mt-2 group">
          <span className="flex items-center gap-3">
            <FiSettings className="text-[18px] group-hover:scale-110 transition-transform duration-300" />
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;