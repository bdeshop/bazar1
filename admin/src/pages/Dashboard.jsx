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
  Legend
} from 'recharts';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { FiRefreshCw, FiTrendingUp, FiTrendingDown, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSpinner } from 'react-icons/fa';
import loader from "../assets/loading.gif"

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
        return;
      default:
        startDate = new Date(today.setDate(today.getDate() - 30));
    }
    
    setDateRange({
      startDate,
      endDate: new Date()
    });
  };

  // Loader Component
  const Loader = () => (
    <div className="flex justify-center items-center h-[90vh]">
      <div className="relative flex justify-center items-center flex-col">
          <img src={loader} className='w-[65px]' alt="" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="font-poppins min-h-screen ">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-8 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <Loader />
          </main>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="font-poppins min-h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-8 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                <div className="text-red-600 text-5xl mb-4">⚠️</div>
                <p className="text-red-600 text-lg font-semibold mb-6">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (!dashboardData) {
    return (
      <section className="font-poppins min-h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-8 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <Loader />
          </main>
        </div>
      </section>
    );
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

  // Professional color palette
  const gradientColors = [
    'from-blue-600 to-blue-800',
    'from-green-600 to-green-800',
    'from-orange-600 to-orange-800',
    'from-purple-600 to-purple-800',
    'from-teal-600 to-teal-800',
    'from-red-600 to-red-800',
    'from-indigo-600 to-indigo-800',
    'from-cyan-600 to-cyan-800',
    'from-rose-600 to-rose-800',
    'from-amber-600 to-amber-800',
    'from-emerald-600 to-emerald-800',
    'from-violet-600 to-violet-800',
    'from-fuchsia-600 to-fuchsia-800',
    'from-lime-600 to-lime-800',
    'from-sky-600 to-sky-800'
  ];

  // Status cards data
  const statusCards = [
    {
      title: 'Total Users',
      value: dashboardData.summary.users.total,
      icon: <FaUsers className="text-3xl text-white" />,
      description: `${dashboardData.summary.users.today} new today`,
      trend: 'up'
    },
    {
      title: 'Total Deposits',
      value: `৳${(dashboardData.summary.financial.totalDeposit || 0).toLocaleString()}`,
      icon: <FaMoneyCheckAlt className="text-3xl text-white" />,
      description: `৳${dashboardData.summary.deposits.todayAmount.toLocaleString()} today`,
      trend: 'up'
    },
    {
      title: 'Total Withdrawals',
      value: `৳${(dashboardData.summary.financial.totalWithdraw || 0).toLocaleString()}`,
      icon: <FaBangladeshiTakaSign className="text-3xl text-white" />,
      description: `৳${dashboardData.summary.withdrawals.todayAmount.toLocaleString()} today`,
      trend: 'up'
    },
    {
      title: 'Pending Approvals',
      value: (dashboardData.summary.pendingApprovals.deposits || 0) + (dashboardData.summary.pendingApprovals.withdrawals || 0),
      icon: <FaClock className="text-3xl text-white" />,
      description: 'Requires attention',
      trend: 'neutral'
    },
    {
      title: 'Pending Deposits',
      value: getStatusCount(depositStatusData, 'pending'),
      icon: <FaHourglassHalf className="text-3xl text-white" />,
      description: `৳${getStatusAmount(depositStatusData, 'pending').toLocaleString()} pending`,
      trend: 'neutral'
    },
    {
      title: 'Pending Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'pending'),
      icon: <FaHourglassHalf className="text-3xl text-white" />,
      description: `৳${getStatusAmount(withdrawalStatusData, 'pending').toLocaleString()} pending`,
      trend: 'neutral'
    },
    {
      title: 'Completed Deposits',
      value: getStatusCount(depositStatusData, 'completed'),
      icon: <FaCheckCircle className="text-3xl text-white" />,
      description: `৳${getStatusAmount(depositStatusData, 'completed').toLocaleString()} completed`,
      trend: 'up'
    },
    {
      title: 'Completed Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'completed'),
      icon: <FaCheckCircle className="text-3xl text-white" />,
      description: `৳${getStatusAmount(withdrawalStatusData, 'completed').toLocaleString()} completed`,
      trend: 'up'
    },
    {
      title: 'Rejected Deposits',
      value: getStatusCount(depositStatusData, 'rejected'),
      icon: <FaTimesCircle className="text-3xl text-white" />,
      description: `৳${getStatusAmount(depositStatusData, 'rejected').toLocaleString()} rejected`,
      trend: 'down'
    },
    {
      title: 'Rejected Withdrawals',
      value: getStatusCount(withdrawalStatusData, 'rejected'),
      icon: <FaTimesCircle className="text-3xl text-white" />,
      description: `৳${getStatusAmount(withdrawalStatusData, 'rejected').toLocaleString()} rejected`,
      trend: 'down'
    },
    {
      title: 'Active Games',
      value: dashboardData.summary.games.active,
      icon: <FaGamepad className="text-3xl text-white" />,
      description: `${dashboardData.summary.games.total} total games`,
      trend: 'up'
    },
    {
      title: 'Inactive Games',
      value: dashboardData.summary.games.inactive,
      icon: <FaGamepad className="text-3xl text-white" />,
      description: `${dashboardData.summary.games.total} total games`,
      trend: 'down'
    },
    {
      title: 'Total Categories',
      value: dashboardData.summary.categories.total,
      icon: <FaTags className="text-3xl text-white" />,
      description: `${dashboardData.summary.categories.active} active`,
      trend: 'up'
    },
    {
      title: 'Total Providers',
      value: dashboardData.summary.providers.total,
      icon: <FaUsers className="text-3xl text-white" />,
      description: `${dashboardData.summary.providers.active} active`,
      trend: 'up'
    },
    {
      title: 'Inactive Providers',
      value: dashboardData.summary.providers.inactive,
      icon: <FaUsers className="text-3xl text-white" />,
      description: `${dashboardData.summary.providers.total} total providers`,
      trend: 'down'
    }
  ].map((card, index) => ({
    ...card,
    gradient: gradientColors[index % gradientColors.length]
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
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
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6EE7B7'];

  return (
    <section className="font-nunito min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className={`transition-all duration-300 flex-1 p-8 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Real-time insights and analytics for your platform.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
            {statusCards.map((card, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-r ${card.gradient} rounded-lg p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 min-h-[140px] flex flex-col`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wide opacity-90">{card.title}</p>
                    <h2 className="text-2xl font-bold mt-1 truncate">{card.value}</h2>
                  </div>
                  <div className="p-3  border-[1px] border-gray-200 text-gray-700 bg-opacity-20 rounded-full flex-shrink-0">
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-center mt-auto text-sm opacity-90">
                  {card.trend === 'up' ? (
                    <FiTrendingUp className="mr-1 text-green-300" />
                  ) : card.trend === 'down' ? (
                    <FiTrendingDown className="mr-1 text-red-300" />
                  ) : null}
                  <span className="truncate">{card.description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-xl p-8 border-[1px] border-gray-200 mb-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Financial Overview</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Period:</span>
                <span className="text-sm font-medium text-gray-800">
                  {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border-[1px] border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Total Deposits', value: dashboardData.summary.financial.totalDeposit || 0 },
                    { label: 'Total Withdrawals', value: dashboardData.summary.financial.totalWithdraw || 0 },
                    { label: 'Total Bets', value: dashboardData.summary.financial.totalBet || 0 },
                    { label: 'Platform Balance', value: dashboardData.summary.financial.totalBalance || 0 },
                    { label: 'Bonus Balance', value: dashboardData.summary.financial.totalBonusBalance || 0 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ৳{(item.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* User Registration Trend */}
            <div className="bg-white rounded-xl p-8 border-[1px] border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">User Registration Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userRegistrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Deposit vs Withdrawal */}
            <div className="bg-white rounded-xl p-8 border-[1px] border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Deposits vs Withdrawals</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{
                  name: 'Deposits',
                  value: dashboardData.summary.financial.totalDeposit || 0
                }, {
                  name: 'Withdrawals',
                  value: dashboardData.summary.financial.totalWithdraw || 0
                }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    content={<CustomTooltip />}
                    formatter={(value) => [`৳${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Deposit Status */}
            <div className="bg-white rounded-xl p-8 border-[1px] border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Deposit Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={depositStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {depositStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Withdrawal Status */}
            <div className="bg-white rounded-xl p-8 border-[1px] border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Withdrawal Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={withdrawalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {withdrawalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
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