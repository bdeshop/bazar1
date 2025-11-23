import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaUsers, 
  FaWallet, 
  FaLink, 
  FaChartBar, 
  FaUser, 
  FaArrowUp, 
  FaArrowDown,
  FaStar,
  FaRocket,
  FaCrown,
  FaGem,
  FaCoins,
  FaPercentage,
  FaCalendarAlt
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { FaShieldAlt } from "react-icons/fa";

const Dashboard = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Profile states
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    masterCode: '',
    commissionRate: 0,
    depositRate: 0,
    cpaRate: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalSubAffiliates: 0,
    activeSubAffiliates: 0,
    paymentMethod: 'bkash',
    formattedPaymentDetails: {},
    isVerified: false,
    lastLogin: '',
    minimumPayout: 0,
    status: 'active',
    overrideCommission: 0
  });

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    earningsThisMonth: 0,
    monthlyGrowth: 0,
    totalSubAffiliates: 0,
    activeSubAffiliates: 0,
    conversionRate: 0,
    averageEarningPerSub: 0,
    commissionRate: 0,
    overrideCommission: 0,
    availableForPayout: 0,
    canRequestPayout: false,
    minimumPayout: 0
  });

  const [recentEarnings, setRecentEarnings] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load affiliate data from localStorage and dashboard stats
  useEffect(() => {
    const affiliateData = localStorage.getItem('masterAffiliate');
    if (affiliateData) {
      const parsedData = JSON.parse(affiliateData);
      setProfile(parsedData);
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.get(`${base_url}/api/master-affiliate/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data.success) {
        const stats = response.data.stats;
        setDashboardStats({
          totalEarnings: stats.totalEarnings || 0,
          pendingEarnings: stats.pendingEarnings || 0,
          paidEarnings: stats.paidEarnings || 0,
          earningsThisMonth: stats.earningsThisMonth || 0,
          monthlyGrowth: stats.monthlyGrowth || 0,
          totalSubAffiliates: stats.totalSubAffiliates || 0,
          activeSubAffiliates: stats.activeSubAffiliates || 0,
          conversionRate: stats.conversionRate || 0,
          averageEarningPerSub: stats.averageEarningPerSub || 0,
          commissionRate: stats.commissionRate || 0,
          overrideCommission: stats.overrideCommission || 0,
          availableForPayout: stats.availableForPayout || 0,
          canRequestPayout: stats.canRequestPayout || false,
          minimumPayout: stats.minimumPayout || 0
        });

        if (response.data.recentEarnings) {
          setRecentEarnings(response.data.recentEarnings);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.post(
        `${base_url}/api/master-affiliate/payout/request`, 
        { amount: dashboardStats.pendingEarnings },
        { headers: { Authorization: `Bearer ${localStorage.getItem('masterAffiliateToken')}` } }
      );

      if (response.data.success) {
        toast.success('Payout request submitted successfully!');
        loadDashboardStats();
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error(error.response?.data?.message || 'Failed to request payout');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGradientClass = (type) => {
    const gradients = {
      primary: 'from-purple-600 via-pink-600 to-blue-600',
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-amber-500 to-orange-600',
      danger: 'from-rose-500 to-red-600',
      info: 'from-cyan-500 to-blue-600',
      premium: 'from-violet-600 to-purple-700',
      gold: 'from-yellow-500 to-amber-600',
      ocean: 'from-blue-500 to-cyan-600',
      sunset: 'from-orange-500 to-pink-600',
      forest: 'from-green-500 to-emerald-600',
      royalty: 'from-indigo-500 to-purple-600',
      coral: 'from-red-400 to-pink-500'
    };
    return `bg-gradient-to-br ${gradients[type] || gradients.primary}`;
  };

  const getIconBgClass = (type) => {
    const classes = {
      primary: 'bg-purple-100 text-purple-600',
      success: 'bg-emerald-100 text-emerald-600',
      warning: 'bg-amber-100 text-amber-600',
      danger: 'bg-rose-100 text-rose-600',
      info: 'bg-cyan-100 text-cyan-600',
      premium: 'bg-violet-100 text-violet-600',
      gold: 'bg-yellow-100 text-yellow-600'
    };
    return classes[type] || classes.primary;
  };

  const statsCards = [
    {
      title: "Total Earnings",
      value: dashboardStats.totalEarnings,
      description: "Lifetime earnings",
      change: dashboardStats.monthlyGrowth,
      icon: FaCoins,
      gradient: "gold",
      trend: dashboardStats.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: "Pending Earnings",
      value: dashboardStats.pendingEarnings,
      description: "Available for payout",
      change: 0,
      icon: FaMoneyBillWave,
      gradient: "warning",
      trend: 'neutral'
    },
    {
      title: "Active Sub-Affiliates",
      value: dashboardStats.activeSubAffiliates,
      description: `Total: ${dashboardStats.totalSubAffiliates}`,
      change: 0,
      icon: FaUsers,
      gradient: "success",
      trend: 'up'
    },
    {
      title: "This Month",
      value: dashboardStats.earningsThisMonth,
      description: "Monthly earnings",
      change: dashboardStats.monthlyGrowth,
      icon: FaCalendarAlt,
      gradient: "info",
      trend: dashboardStats.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: "Commission Rate",
      value: dashboardStats.commissionRate,
      description: "Your commission percentage",
      change: 0,
      icon: FaPercentage,
      gradient: "premium",
      trend: 'neutral',
      isPercentage: true
    },
    {
      title: "Registration Commission",
      value: dashboardStats.overrideCommission,
      description: "From sub-affiliates",
      change: 0,
      icon: FaCrown,
      gradient: "royalty",
      trend: 'neutral',
      isPercentage: false
    }
  ];

  const quickStats = [
    {
      title: "Conversion Rate",
      value: dashboardStats.conversionRate?.toFixed(1) || 0,
      unit: "%",
      icon: FaChartBar,
      color: "from-green-400 to-emerald-500",
      bg: "bg-gradient-to-r from-green-400 to-emerald-500"
    },
    {
      title: "Avg per Sub",
      value: dashboardStats.averageEarningPerSub?.toFixed(0) || 0,
      unit: "",
      icon: FaUser,
      color: "from-blue-400 to-cyan-500",
      bg: "bg-gradient-to-r from-blue-400 to-cyan-500"
    },
    {
      title: "Paid Out",
      value: dashboardStats.paidEarnings,
      unit: "",
      icon: FaWallet,
      color: "from-purple-400 to-pink-500",
      bg: "bg-gradient-to-r from-purple-400 to-pink-500"
    }
  ];

  if (loading) {
    return (
      <section className="min-h-screen font-nunito ">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-500 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-700 mt-4 text-[20px]">Loading your master dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all font-poppins duration-500 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Master Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2 flex items-center">
                    <FaCrown className="text-amber-500 mr-2" />
                    Welcome back, {profile.firstName}! Here's your master performance overview.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                    <p className="text-sm text-gray-600">Master Code</p>
                    <p className="font-bold text-purple-600">{profile.masterCode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statsCards.map((card, index) => (
                <div 
                  key={index}
                  className={`${getGradientClass(card.gradient)} rounded-[5px] p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                      <p className="text-3xl font-bold mb-1">
                        {card.isPercentage ? `${card.value}%` : formatCurrency(card.value)}
                      </p>
                      <p className="text-white/70 text-xs">{card.description}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
                      <card.icon className="text-2xl text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {card.trend !== 'neutral' && (
                        <span className={`text-sm font-medium flex items-center ${
                          card.trend === 'up' ? 'text-emerald-200' : 'text-rose-200'
                        }`}>
                          {card.trend === 'up' ? (
                            <FaArrowUp className="mr-1 text-xs" />
                          ) : (
                            <FaArrowDown className="mr-1 text-xs" />
                          )}
                          {Math.abs(card.change)}%
                        </span>
                      )}
                    </div>
                    {card.trend === 'up' && (
                      <div className="bg-white/20 px-2 py-1 rounded-full">
                        <span className="text-xs text-white">🔥 Hot</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Second Row - Quick Stats & Payout Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Quick Stats */}
              {quickStats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-[5px] p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.unit === '%' ? `${stat.value}%` : formatCurrency(stat.value)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} text-white`}>
                      <stat.icon className="text-xl" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Payout Eligibility Card */}
              <div className={`rounded-[5px] p-6 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                dashboardStats.canRequestPayout 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600'
              }`}>
                <div className="text-white text-center">
                  <FaWallet className="text-2xl mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">
                    {dashboardStats.canRequestPayout ? 'Ready for Payout!' : 'Almost There!'}
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    {dashboardStats.canRequestPayout 
                      ? `You can request ${formatCurrency(dashboardStats.pendingEarnings)}`
                      : `Need ${formatCurrency(dashboardStats.minimumPayout - dashboardStats.pendingEarnings)} more`
                    }
                  </p>
                  <button 
                    onClick={handlePayoutRequest}
                    disabled={!dashboardStats.canRequestPayout}
                    className={`w-full py-2 px-4 rounded-[5px] font-medium transition-all duration-300 ${
                      dashboardStats.canRequestPayout
                        ? 'bg-white text-emerald-600 hover:bg-gray-100 hover:scale-105'
                        : 'bg-white/20 text-white cursor-not-allowed'
                    }`}
                  >
                    {dashboardStats.canRequestPayout ? 'Request Payout' : 'Not Eligible'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Dashboard;