import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaUsers, FaWallet, FaLink, FaChartBar, FaUser, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

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
    affiliateCode: '',
    commissionRate: 0,
    cpaRate: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    referralCount: 0,
    paymentMethod: 'bkash',
    formattedPaymentDetails: {},
    isVerified: false,
    lastLogin: '',
    minimumPayout: 0,
    status: 'active',
    totalPayout: 0,
    pendingPayout: 0
  });

  // Dashboard stats - initialize with zeros
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    referralCount: 0,
    commissionRate: 0,
    cpaRate: 0,
    minimumPayout: 0,
    availableForPayout: 0,
    daysUntilPayout: 0,
    activeReferrals: 0,
    conversionRate: 0,
    clickCount: 0,
    earningsThisMonth: 0,
    totalBalance: 0,
    totalPeriodChange: 0,
    totalPeriodExpenses: 0,
    totalPeriodIncome: 0,
    balanceChange: 0,
    periodChange: 0,
    expensesChange: 0,
    incomeChange: 0,
    lastMonthBalance: 0,
    lastMonthPeriodChange: 0,
    lastMonthExpenses: 0,
    lastMonthIncome: 0,
    totalPayout: 0,
    pendingPayout: 0
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load affiliate data from localStorage and dashboard stats
  useEffect(() => {
    const affiliateData = localStorage.getItem('affiliate');
    if (affiliateData) {
      const parsedData = JSON.parse(affiliateData);
      setProfile({
        ...parsedData,
        cpaRate: parsedData.cpaRate || 200,
        totalPayout: parsedData.totalPayout || 0,
        pendingPayout: parsedData.pendingPayout || 0
      });
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.get(`${base_url}/api/affiliate/dashboard`,  { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (response.data.success) {
        const stats = response.data.stats;
        setDashboardStats(prevStats => ({
          ...prevStats,
          ...stats,
          totalBalance: stats.totalEarnings || 0,
          totalPeriodChange: stats.pendingEarnings || 0,
          totalPeriodExpenses: stats.paidEarnings || 0,
          totalPeriodIncome: stats.earningsThisMonth || 0,
          balanceChange: stats.balanceChange || 0,
          periodChange: stats.periodChange || 0,
          expensesChange: stats.expensesChange || 0,
          incomeChange: stats.incomeChange || 0,
          lastMonthBalance: stats.lastMonthBalance || 0,
          lastMonthPeriodChange: stats.lastMonthPeriodChange || 0,
          lastMonthExpenses: stats.lastMonthExpenses || 0,
          lastMonthIncome: stats.lastMonthIncome || 0,
          cpaRate: stats.cpaRate || 200,
          totalPayout: stats.totalPayout || 0,
          pendingPayout: stats.pendingPayout || 0
        }));
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
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.post(`${base_url}/api/affiliate/payout/request`, 
        { amount: dashboardStats.pendingEarnings },
        { headers: { Authorization: `Bearer ${token}` } }
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

  const isEligibleForPayout = dashboardStats.pendingEarnings >= dashboardStats.minimumPayout;

  const getColorClasses = (color) => {
    const colorMap = {
      indigo: {
        bg: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
        border: 'border-indigo-400',
        text: 'text-white',
        iconBg: 'bg-indigo-300',
        icon: 'text-indigo-800'
      },
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
        border: 'border-emerald-400',
        text: 'text-white',
        iconBg: 'bg-emerald-300',
        icon: 'text-emerald-800'
      },
      rose: {
        bg: 'bg-gradient-to-br from-rose-500 to-rose-700',
        border: 'border-rose-400',
        text: 'text-white',
        iconBg: 'bg-rose-300',
        icon: 'text-rose-800'
      },
      amber: {
        bg: 'bg-gradient-to-br from-amber-500 to-amber-700',
        border: 'border-amber-400',
        text: 'text-white',
        iconBg: 'bg-amber-300',
        icon: 'text-amber-800'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-500 to-purple-700',
        border: 'border-purple-400',
        text: 'text-white',
        iconBg: 'bg-purple-300',
        icon: 'text-purple-800'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  const statsCards = [
    {
      title: "Total Balance",
      value: dashboardStats.totalBalance,
      change: dashboardStats.balanceChange,
      lastMonth: dashboardStats.lastMonthBalance,
      icon: FaWallet,
      color: "indigo"
    },
    {
      title: "Total Period Change",
      value: dashboardStats.totalPeriodChange,
      change: dashboardStats.periodChange,
      lastMonth: dashboardStats.lastMonthPeriodChange,
      icon: FaChartLine,
      color: "emerald"
    },
    {
      title: "Total Period Expenses",
      value: dashboardStats.totalPeriodExpenses,
      change: dashboardStats.expensesChange,
      lastMonth: dashboardStats.lastMonthExpenses,
      icon: FaMoneyBillWave,
      color: "rose"
    },
    {
      title: "Total Period Income",
      value: dashboardStats.totalPeriodIncome,
      change: dashboardStats.incomeChange,
      lastMonth: dashboardStats.lastMonthIncome,
      icon: FaUsers,
      color: "amber"
    }
  ];

  if (loading) {
    return (
      <section className="font-nunito min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-teal-100">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all font-poppins duration-500 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-indigo-600 mt-4 font-medium">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white ">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all font-poppins duration-500 no-scrollbar flex-1 p-8 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-indigo-900">Super Affiliate Dashboard</h1>
              <p className="text-indigo-600 mt-2 text-lg">Welcome back, {profile.firstName}! Explore your vibrant performance overview.</p>
            </div>

            {/* Stats Cards - Using vibrant gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((card, index) => {
                const colorClasses = getColorClasses(card.color);
                const IconComponent = card.icon;
                
                return (
                  <div 
                    key={index}
                    className={`${colorClasses.bg} border ${colorClasses.border} rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-white opacity-80 mb-1">{card.title}</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(card.value)}</p>
                      </div>
                      <div className={`p-3 rounded-full ${colorClasses.iconBg}`}>
                        <IconComponent className={`text-2xl ${colorClasses.icon}`} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${colorClasses.text} flex items-center`}>
                          {card.change > 0 ? (
                            <FaArrowUp className="mr-1 text-xs" />
                          ) : (
                            <FaArrowDown className="mr-1 text-xs" />
                          )}
                          {card.change}%
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white opacity-70">Last month</p>
                        <p className="text-sm font-medium text-white">{formatCurrency(card.lastMonth)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Stats Cards with vibrant gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 border border-teal-400 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white opacity-80">Pending Earnings</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(dashboardStats.pendingEarnings)}</p>
                    <p className="text-xs text-white opacity-70 mt-2">Min. payout: {formatCurrency(dashboardStats.minimumPayout)}</p>
                  </div>
                  <div className="p-3 bg-teal-300 rounded-full">
                    <FaMoneyBillWave className="text-2xl text-teal-800" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white opacity-80">Total Earnings</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(dashboardStats.totalEarnings)}</p>
                    <p className="text-xs text-white opacity-70 mt-2">Lifetime earnings</p>
                  </div>
                  <div className="p-3 bg-blue-300 rounded-full">
                    <FaChartLine className="text-2xl text-blue-800" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-600 border border-purple-400 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white opacity-80">Referrals</p>
                    <p className="text-3xl font-bold text-white mt-1">{dashboardStats.referralCount.toLocaleString()}</p>
                    <p className="text-xs text-white opacity-70 mt-2">{dashboardStats.activeReferrals || 0} active</p>
                  </div>
                  <div className="p-3 bg-purple-300 rounded-full">
                    <FaUsers className="text-2xl text-purple-800" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400 p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white opacity-80">CPA Rate</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(dashboardStats.cpaRate)}</p>
                    <p className="text-xs text-white opacity-70 mt-2">Per successful registration</p>
                  </div>
                  <div className="p-3 bg-orange-300 rounded-full">
                    <FaWallet className="text-2xl text-orange-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Content */}
            <div className="space-y-8">
              {/* Payout Information Card */}
              <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg p-8 border border-cyan-400 transform transition-shadow duration-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">Payout Information</h3>
                    <p className="text-white opacity-80 mt-2">
                      {isEligibleForPayout 
                        ? `You're eligible to request a payout of ${formatCurrency(dashboardStats.pendingEarnings)}`
                        : `You need ${formatCurrency(dashboardStats.minimumPayout - dashboardStats.pendingEarnings)} more to be eligible for payout`
                      }
                    </p>
                    <p className="text-white opacity-80 mt-2">Total Payout: {formatCurrency(dashboardStats.totalPayout)}</p>
                    <p className="text-white opacity-80 mt-2">Pending Payout: {formatCurrency(dashboardStats.pendingPayout)}</p>
                  </div>
                  <div className="flex items-center">
                    {isEligibleForPayout ? (
                      <button 
                        onClick={handlePayoutRequest}
                        className="px-6 py-3 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium flex items-center transform hover:scale-105"
                      >
                        <FaWallet className="mr-2" />
                        Request Payout
                      </button>
                    ) : (
                      <div className="flex items-center text-amber-100 bg-amber-600 px-4 py-2 rounded-lg">
                        <FaWallet className="mr-2" />
                        <span>Not eligible yet</span>
                      </div>
                    )}
                  </div>
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