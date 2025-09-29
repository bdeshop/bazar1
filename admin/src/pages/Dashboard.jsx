import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  FaDollarSign, 
  FaUsers, 
  FaMoneyCheckAlt, 
  FaClock, 
  FaChartLine, 
  FaGamepad,
  FaShoppingBag,
  FaImage,
  FaTags,
  FaUserCheck,
  FaUserTimes,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaFilter,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [filterType, setFilterType] = useState('30days');
  const [showFilters, setShowFilters] = useState(false);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      };
      
      const response = await axios.get(`${base_url}/api/admin/dashboard`, { params });
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    const today = new Date();
    let startDate;
    
    switch(type) {
      case 'today':
        startDate = new Date();
        break;
      case '7days':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(today.setDate(today.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(today.setDate(today.getDate() - 90));
        break;
      case 'custom':
        // Don't change dates for custom, let user pick
        return;
      default:
        startDate = new Date(today.setDate(today.getDate() - 30));
    }
    
    setDateRange({
      startDate,
      endDate: new Date()
    });
  };

  if (loading) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
            <div className="relative w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
      <svg className="h-8 w-8 text-white animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Prepare chart data
  const userRegistrationData = dashboardData.detailedStats?.users?.registrationTrend?.map(item => ({
    date: item._id,
    users: item.count
  })) || [];

  // Extract status counts for deposits and withdrawals
  const getStatusCount = (data, status) => {
    const item = data.find(item => item._id === status);
    return item ? item.count : 0;
  };

  const getStatusAmount = (data, status) => {
    const item = data.find(item => item._id === status);
    return item ? item.totalAmount : 0;
  };

  const depositStatusData = dashboardData.detailedStats?.deposits?.byStatus || [];
  const withdrawalStatusData = dashboardData.detailedStats?.withdrawals?.byStatus || [];

  // Status cards data - All requested boxes
  const statusCards = [
    {
      title: 'Total Users',
      value: dashboardData.summary.users.total,
      icon: <FaUsers className="text-2xl text-white" />,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      description: `${dashboardData.summary.users.today} new today`,
      trend: 'up'
    },
    {
      title: 'Total Deposits',
      value: `৳${(dashboardData.summary.financial.totalDeposit || 0).toLocaleString()}`,
      icon: <FaMoneyCheckAlt className="text-2xl text-white" />,
      gradient: 'from-green-500 via-green-600 to-green-700',
      description: `৳${dashboardData.summary.deposits.todayAmount.toLocaleString()} today`,
      trend: 'up'
    },
    {
      title: 'Total Withdrawals',
      value: `৳${(dashboardData.summary.financial.totalWithdraw || 0).toLocaleString()}`,
      icon: <FaBangladeshiTakaSign className="text-2xl text-white" />,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      description: `৳${dashboardData.summary.withdrawals.todayAmount.toLocaleString()} today`,
      trend: 'up'
    },
    {
      title: 'Pending Approvals',
      value: (dashboardData.summary.pendingApprovals.deposits || 0) + (dashboardData.summary.pendingApprovals.withdrawals || 0),
      icon: <FaClock className="text-2xl text-white" />,
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      description: 'Requires immediate attention',
      trend: 'neutral'
    },
    // Additional boxes as requested
    {
      title: 'Pending Deposits',
      value: getStatusCount(depositStatusData, 'pending'),
      icon: <FaHourglassHalf className="text-2xl text-white" />,
      gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
      description: `৳${getStatusAmount(depositStatusData, 'pending').toLocaleString()} pending`,
      trend: 'neutral'
    },
    {
      title: 'Pending Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'pending'),
      icon: <FaHourglassHalf className="text-2xl text-white" />,
      gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
      description: `৳${getStatusAmount(withdrawalStatusData, 'pending').toLocaleString()} pending`,
      trend: 'neutral'
    },
    {
      title: 'Completed Deposits',
      value: getStatusCount(depositStatusData, 'completed'),
      icon: <FaCheckCircle className="text-2xl text-white" />,
      gradient: 'from-green-500 via-green-600 to-green-700',
      description: `৳${getStatusAmount(depositStatusData, 'completed').toLocaleString()} completed`,
      trend: 'up'
    },
    {
      title: 'Completed Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'completed'),
      icon: <FaCheckCircle className="text-2xl text-white" />,
      gradient: 'from-green-500 via-green-600 to-green-700',
      description: `৳${getStatusAmount(withdrawalStatusData, 'completed').toLocaleString()} completed`,
      trend: 'up'
    },
    {
      title: 'Rejected Deposits',
      value: getStatusCount(depositStatusData, 'rejected'),
      icon: <FaTimesCircle className="text-2xl text-white" />,
      gradient: 'from-red-500 via-red-600 to-red-700',
      description: `৳${getStatusAmount(depositStatusData, 'rejected').toLocaleString()} rejected`,
      trend: 'down'
    },
    {
      title: 'Rejected Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'rejected'),
      icon: <FaTimesCircle className="text-2xl text-white" />,
      gradient: 'from-red-500 via-red-600 to-red-700',
      description: `৳${getStatusAmount(withdrawalStatusData, 'rejected').toLocaleString()} rejected`,
      trend: 'down'
    },
    {
      title: 'Active Games',
      value: dashboardData.summary.games.active,
      icon: <FaGamepad className="text-2xl text-white" />,
      gradient: 'from-teal-500 via-teal-600 to-teal-700',
      description: `${dashboardData.summary.games.total} total games`,
      trend: 'up'
    },
    {
      title: 'Inactive Games',
      value: dashboardData.summary.games.inactive,
      icon: <FaGamepad className="text-2xl text-white" />,
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      description: `${dashboardData.summary.games.total} total games`,
      trend: 'down'
    },
    {
      title: 'Total Categories',
      value: dashboardData.summary.categories.total,
      icon: <FaTags className="text-2xl text-white" />,
      gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
      description: `${dashboardData.summary.categories.active} active, ${dashboardData.summary.categories.inactive} inactive`,
      trend: 'up'
    },
    {
      title: 'Total Providers',
      value: dashboardData.summary.providers.total,
      icon: <FaUsers className="text-2xl text-white" />,
      gradient: 'from-pink-500 via-pink-600 to-pink-700',
      description: `${dashboardData.summary.providers.active} active, ${dashboardData.summary.providers.inactive} inactive`,
      trend: 'up'
    },
    {
      title: 'Inactive Providers',
      value: dashboardData.summary.providers.inactive,
      icon: <FaUsers className="text-2xl text-white" />,
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      description: `${dashboardData.summary.providers.total} total providers`,
      trend: 'down'
    }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Amount') || entry.name.includes('৳') ? `৳${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? ' md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Welcome back, Admin! Here's what's happening today.</p>
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-white rounded-lg border overflow-auto border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                  <FaFilter className="mr-2" />
                  Filters
                  <FiChevronDown className="ml-2" />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Filter Dashboard Data</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {['today', '7days', '30days', '90days', 'custom'].map((type) => (
                        <button
                          key={type}
                          onClick={() => handleFilterChange(type)}
                          className={`px-3 py-2 rounded text-sm ${
                            filterType === type 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'today' ? 'Today' : 
                           type === '7days' ? '7 Days' : 
                           type === '30days' ? '30 Days' : 
                           type === '90days' ? '90 Days' : 
                           'Custom'}
                        </button>
                      ))}
                    </div>
                    
                    {filterType === 'custom' && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaCalendarAlt className="text-gray-500" />
                          <span className="text-sm text-gray-700">Select Date Range</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                            <DatePicker
                              selected={dateRange.startDate}
                              onChange={(date) => setDateRange({...dateRange, startDate: date})}
                              selectsStart
                              startDate={dateRange.startDate}
                              endDate={dateRange.endDate}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">End Date</label>
                            <DatePicker
                              selected={dateRange.endDate}
                              onChange={(date) => setDateRange({...dateRange, endDate: date})}
                              selectsEnd
                              startDate={dateRange.startDate}
                              endDate={dateRange.endDate}
                              minDate={dateRange.startDate}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded text-sm font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={fetchDashboardData}
                className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
              >
                <FiRefreshCw className="mr-2" />
                Refresh Data
              </button>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Last updated: </span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div> */}
          </div>

          {/* All Stats Cards - Consistent 5 columns layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
            {statusCards.map((card, index) => (
          <div
  key={index}
  className={`bg-blue-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
  <div className="flex justify-between items-start mb-3">
    <div className="flex-1">
      <p className="text-xs font-medium opacity-90 mb-1">{card.title}</p>
      <h2 className="text-xl font-bold truncate">{card.value}</h2>
    </div>
    <div className="p-2 rounded-lg bg-opacity-20 flex-shrink-0 ml-2">
      {card.icon}
    </div>
  </div>
  <div className="flex items-center mt-auto text-xs opacity-90">
    {card.trend === 'up' ?
      <FiTrendingUp className="mr-1" /> :
      card.trend === 'down' ?
      <FiTrendingDown className="mr-1" /> : null
    }
    <span className="truncate">{card.description}</span>
  </div>
</div>
            ))}
          </div>

          {/* Financial Overview Chart */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Financial Overview</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm opacity-80">Period:</span>
                <span className="text-sm font-medium">
                  {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={[
                      { name: 'Deposits', value: dashboardData.summary.financial.totalDeposit || 0 },
                      { name: 'Withdrawals', value: dashboardData.summary.financial.totalWithdraw || 0 },
                      { name: 'Bets', value: dashboardData.summary.financial.totalBet || 0 },
                      { name: 'Balance', value: dashboardData.summary.financial.totalBalance || 0 },
                      { name: 'Bonus', value: dashboardData.summary.financial.totalBonusBalance || 0 }
                    ]} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#333'
                      }} 
                      formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="value" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-md font-medium mb-4">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Deposits</span>
                    <span className="text-sm font-semibold">
                      ৳{(dashboardData.summary.financial.totalDeposit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Withdrawals</span>
                    <span className="text-sm font-semibold">
                      ৳{(dashboardData.summary.financial.totalWithdraw || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Bets</span>
                    <span className="text-sm font-semibold">
                      ৳{(dashboardData.summary.financial.totalBet || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Balance</span>
                    <span className="text-sm font-semibold">
                      ৳{(dashboardData.summary.financial.totalBalance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bonus Balance</span>
                    <span className="text-sm font-semibold">
                      ৳{(dashboardData.summary.financial.totalBonusBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Registration Trend Chart */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-6">User Registration Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userRegistrationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#333'
                    }} 
                  />
                  <Area type="monotone" dataKey="users" stroke="#FFFFFF" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Deposit vs Withdrawal Chart */}
            <div className="bg-gradient-to-r from-rose-600 to-amber-700 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-6">Deposits vs Withdrawals</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{
                  name: 'Deposits',
                  value: dashboardData.summary.financial.totalDeposit || 0
                }, {
                  name: 'Withdrawals',
                  value: dashboardData.summary.financial.totalWithdraw || 0
                }]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#333'
                    }} 
                    formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Overview Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Deposit Status */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-6">Deposit Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={depositStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {depositStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#333'
                    }} 
                    formatter={(value, name, props) => {
                      if (name === 'count') return [value, 'Count'];
                      if (name === 'amount') return [`৳${value.toLocaleString()}`, 'Amount'];
                      return [value, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Withdrawal Status */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-700 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-6">Withdrawal Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={withdrawalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {withdrawalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#333'
                    }} 
                    formatter={(value, name, props) => {
                      if (name === 'count') return [value, 'Count'];
                      if (name === 'amount') return [`৳${value.toLocaleString()}`, 'Amount'];
                      return [value, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

     
        </main>
      </div>
    </section>
  );
};

export default Dashboard;