import React, { useState, useEffect } from 'react';
import { 
  FaFilter, 
  FaDownload, 
  FaSearch, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaCalendarAlt,
  FaEye,
  FaRegClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFileExport,
  FaSync,
  FaUserPlus,
  FaUsers,
  FaMousePointer,
  FaCrown,
  FaCoins,
  FaUserFriends,
  FaPercentage
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBangladeshiTakaSign } from "react-icons/fa6";

const Earnings = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [payoutHistory, setPayoutHistory] = useState({
    total: 0,
    page: 1,
    limit: 10,
    payouts: []
  });

  // Master Affiliate Earnings data state
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    earningsThisMonth: 0,
    monthlyGrowth: 0,
    totalSubAffiliates: 0,
    activeSubAffiliates: 0,
    conversionRate: 0,
    commissionRate: 0,
    depositRate: 0,
    cpaRate: 0,
    overrideCommission: 0,
    availableForPayout: 0,
    canRequestPayout: false,
    minimumPayout: 2000,
    earningsHistory: [],
    earningsSummary: {
      total: 0,
      pending: 0,
      paid: 0,
      byType: {}
    },
    subAffiliatePerformance: []
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load earnings data
  useEffect(() => {
    loadEarningsData();
    loadPayoutHistory();
  }, [timeRange, currentPage]);

  const loadEarningsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');
      
      // Load master affiliate dashboard data
      const dashboardResponse = await axios.get(`${base_url}/api/master-affiliate/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Load earnings history
      const earningsResponse = await axios.get(`${base_url}/api/master-affiliate/earnings/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Load sub-affiliates data
      const subAffiliatesResponse = await axios.get(`${base_url}/api/master-affiliate/referred-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (dashboardResponse.data.success) {
        const dashboardStats = dashboardResponse.data.stats;
        const earningsHistory = earningsResponse.data.success ? earningsResponse.data.earnings : [];
        const subAffiliates = subAffiliatesResponse.data.success ? subAffiliatesResponse.data.referredUsers : [];
        
        // Calculate earnings summary
        const earningsSummary = calculateEarningsSummary(earningsHistory);
        
        // Calculate monthly growth
        const monthlyGrowth = calculateMonthlyGrowth(earningsHistory);
        
        // Calculate sub-affiliate performance
        const subAffiliatePerformance = calculateSubAffiliatePerformance(subAffiliates);
        
        setEarningsData(prev => ({
          ...prev,
          totalEarnings: dashboardStats.totalEarnings || 0,
          pendingEarnings: dashboardStats.pendingEarnings || 0,
          paidEarnings: dashboardStats.paidEarnings || 0,
          earningsThisMonth: dashboardStats.earningsThisMonth || 0,
          monthlyGrowth: dashboardStats.monthlyGrowth || monthlyGrowth,
          totalSubAffiliates: dashboardStats.totalSubAffiliates || 0,
          activeSubAffiliates: dashboardStats.activeSubAffiliates || 0,
          conversionRate: dashboardStats.conversionRate || 0,
          commissionRate: dashboardStats.commissionRate || 0,
          overrideCommission: dashboardStats.overrideCommission || 0,
          availableForPayout: dashboardStats.availableForPayout || 0,
          canRequestPayout: dashboardStats.canRequestPayout || false,
          minimumPayout: dashboardStats.minimumPayout || 2000,
          earningsHistory: earningsHistory,
          earningsSummary: earningsSummary,
          subAffiliatePerformance: subAffiliatePerformance
        }));
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayoutHistory = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.get(`${base_url}/api/master-affiliate/payout/history`, {
        params: { page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPayoutHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading payout history:', error);
      toast.error('Failed to load payout history');
    }
  };

  // Calculate earnings summary from earnings history
  const calculateEarningsSummary = (earningsHistory) => {
    const summary = {
      total: 0,
      pending: 0,
      paid: 0,
      byType: {}
    };

    earningsHistory.forEach(earning => {
      summary.total += earning.amount;
      
      if (earning.status === 'pending') {
        summary.pending += earning.amount;
      } else if (earning.status === 'paid') {
        summary.paid += earning.amount;
      }
      
      const type = earning.type;
      if (!summary.byType[type]) {
        summary.byType[type] = {
          total: 0,
          count: 0,
          label: getEarningTypeLabel(type)
        };
      }
      
      summary.byType[type].total += earning.amount;
      summary.byType[type].count += 1;
    });

    return summary;
  };

  // Calculate sub-affiliate performance
  const calculateSubAffiliatePerformance = (subAffiliates) => {
    return subAffiliates.map(sub => ({
      id: sub._id,
      name: `${sub.firstName} ${sub.lastName}`,
      email: sub.email,
      totalEarned: sub.totalEarned || 0,
      status: sub.status,
      joinedAt: sub.joinedAt,
      lastActivity: sub.lastActivity,
      overrideCommission: (sub.totalEarned || 0) * (earningsData.overrideCommission / 100)
    })).sort((a, b) => b.totalEarned - a.totalEarned);
  };

  // Calculate monthly growth percentage
  const calculateMonthlyGrowth = (earningsHistory) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate current month earnings
    const currentMonthEarnings = earningsHistory
      .filter(earning => {
        const earningDate = new Date(earning.earnedAt);
        return earningDate.getMonth() === currentMonth && 
               earningDate.getFullYear() === currentYear;
      })
      .reduce((total, earning) => total + earning.amount, 0);

    // Calculate last month earnings
    const lastMonthEarnings = earningsHistory
      .filter(earning => {
        const earningDate = new Date(earning.earnedAt);
        return earningDate.getMonth() === lastMonth && 
               earningDate.getFullYear() === lastMonthYear;
      })
      .reduce((total, earning) => total + earning.amount, 0);

    if (lastMonthEarnings === 0) {
      return currentMonthEarnings > 0 ? 100 : 0;
    }

    return ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
  };

  // Get human-readable label for earning type
  const getEarningTypeLabel = (type) => {
    const typeLabels = {
      'override_commission': 'Override Commission',
      'bonus': 'Bonus',
      'incentive': 'Incentive',
      'bet_commission': 'Bet Commission',
      'deposit_commission': 'Deposit Commission',
      'withdrawal_commission': 'Withdrawal Commission',
      'registration': 'Registration',
      'other': 'Other'
    };
    return typeLabels[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaRegClock },
      paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
      processing: { color: 'bg-blue-100 text-blue-800', icon: FaRegClock },
      completed: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
      active: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle },
      suspended: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'override_commission': { color: 'bg-purple-100 text-purple-800', label: 'Override' },
      'bonus': { color: 'bg-green-100 text-green-800', label: 'Bonus' },
      'incentive': { color: 'bg-blue-100 text-blue-800', label: 'Incentive' },
      'bet_commission': { color: 'bg-orange-100 text-orange-800', label: 'Bet' },
      'deposit_commission': { color: 'bg-indigo-100 text-indigo-800', label: 'Deposit' },
      'withdrawal_commission': { color: 'bg-red-100 text-red-800', label: 'Withdrawal' },
      'registration': { color: 'bg-teal-100 text-teal-800', label: 'Registration' },
      'other': { color: 'bg-gray-100 text-gray-800', label: 'Other' }
    };
    
    const config = typeConfig[type] || typeConfig.other;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.post(`${base_url}/api/master-affiliate/payout/request`, {
        amount: earningsData.pendingEarnings
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Payout request submitted successfully!');
        loadEarningsData(); // Refresh data
        loadPayoutHistory(); // Refresh payout history
      }
    } catch (error) {
      console.error('Payout request error:', error);
      toast.error(error.response?.data?.message || 'Failed to request payout');
    }
  };

  const refreshData = () => {
    loadEarningsData();
    loadPayoutHistory();
    toast.success('Data refreshed!');
  };

  // Filter earnings history based on search and status
  const filteredEarnings = earningsData.earningsHistory.filter(earning => {
    const matchesSearch = earning.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         earning.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || earning.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(payoutHistory.total / payoutHistory.limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-20">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Master Earnings Overview
                  </h1>
                  <p className="text-gray-600 mt-2 text-sm flex items-center">
                    <FaCrown className="text-amber-500 mr-2" />
                    Track your override commissions and sub-affiliate network earnings
                  </p>
                </div>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' },
                  { value: 'quarter', label: 'This Quarter' },
                  { value: 'year', label: 'This Year' },
                  { value: 'all', label: 'All Time' }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-4 py-2 rounded-[5px]  cursor-pointer font-medium transition-all duration-300 ${
                      timeRange === range.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Master Affiliate Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[5px]  p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(earningsData.totalEarnings)}
                    </p>
                    <p className="text-xs text-white/70 mt-2 flex items-center">
                      <FaChartLine className="mr-1" />
                      +{earningsData.monthlyGrowth.toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaMoneyBillWave className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[5px]  p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Pending Earnings</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(earningsData.pendingEarnings)}
                    </p>
                    <p className="text-xs text-white/70 mt-2">
                      Awaiting clearance
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaRegClock className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Paid Earnings</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(earningsData.paidEarnings)}
                    </p>
                    <p className="text-xs text-white/70 mt-2">
                      Successfully paid out
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[5px]  p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Override Commission</p>
                    <p className="text-2xl font-bold mt-1">
                      {earningsData.overrideCommission}%
                    </p>
                    <p className="text-xs text-white/70 mt-2">
                      From sub-affiliates
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaPercentage className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Network Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[5px]  p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sub-Affiliates</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {earningsData.totalSubAffiliates}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Active: {earningsData.activeSubAffiliates}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaUserFriends className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px]  p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(earningsData.earningsThisMonth)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Monthly earnings
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaCoins className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {earningsData.conversionRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Network performance
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaChartLine className="text-orange-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Eligibility Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaBangladeshiTakaSign className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Available for Payout</h3>
                    <p className="opacity-90 text-lg">
                      {formatCurrency(earningsData.pendingEarnings)} ready to withdraw
                    </p>
                    <p className="text-sm opacity-80 mt-1">
                      Minimum payout: {formatCurrency(earningsData.minimumPayout)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 lg:mt-0">
                  {earningsData.canRequestPayout ? (
                    <button 
                      onClick={handlePayoutRequest}
                      className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md"
                    >
                      Request Payout
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm opacity-90">
                        Need {formatCurrency(earningsData.minimumPayout - earningsData.pendingEarnings)} more
                      </p>
                      <button 
                        disabled
                        className="px-6 py-2 mt-1 bg-white/50 text-white rounded-xl font-medium text-sm cursor-not-allowed"
                      >
                        Request Payout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings History Section */}
              <div className="bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 lg:mb-0">
                      Earnings History
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Search Input */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search earnings..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading earnings history...</p>
                    </div>
                  ) : filteredEarnings.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No earnings history found</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Your earnings will appear here'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type & Description
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEarnings.slice(0, 6).map((earning) => (
                          <tr key={earning._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(earning.earnedAt)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {Math.floor((new Date() - new Date(earning.earnedAt)) / (1000 * 60 * 60 * 24))}d ago
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {getTypeBadge(earning.type)}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {getEarningTypeLabel(earning.type)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {earning.description || 'Master commission earned'}
                                  </div>
                                  {earning.sourceAffiliateInfo && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      From: {earning.sourceAffiliateInfo.firstName} {earning.sourceAffiliateInfo.lastName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(earning.amount)}
                              </div>
                              {earning.overrideRate && (
                                <div className="text-sm text-gray-500">
                                  {earning.overrideRate}% override
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(earning.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {filteredEarnings.length > 6 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <button 
                      onClick={() => window.location.href = '/master/earnings/history'}
                      className="w-full text-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All Earnings
                    </button>
                  </div>
                )}
              </div>

              {/* Sub-Affiliate Performance */}
              <div className="bg-white rounded-[5px] border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Top Performing Sub-Affiliates
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Based on total earnings and override commissions
                  </p>
                </div>

                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading performance data...</p>
                    </div>
                  ) : earningsData.subAffiliatePerformance.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No sub-affiliates yet</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Start building your network to see performance data
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sub-Affiliate
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Earnings
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Your Commission
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {earningsData.subAffiliatePerformance.slice(0, 6).map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {sub.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {sub.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(sub.totalEarned)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-purple-600">
                                {formatCurrency(sub.overrideCommission)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {earningsData.overrideCommission}% override
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(sub.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {earningsData.subAffiliatePerformance.length > 6 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <button 
                      onClick={() => window.location.href = '/master/sub-affiliates'}
                      className="w-full text-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All Sub-Affiliates
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Earnings Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(earningsData.earningsSummary.byType).map(([type, data]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          type === 'override_commission' ? 'bg-purple-500' :
                          type === 'bonus' ? 'bg-green-500' :
                          type === 'incentive' ? 'bg-blue-500' :
                          type === 'bet_commission' ? 'bg-orange-500' :
                          type === 'deposit_commission' ? 'bg-indigo-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-gray-700">{data.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{formatCurrency(data.total)}</span>
                        <div className="text-xs text-gray-500">{data.count} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Master Commission Structure</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Override Commission</span>
                    <span className="font-semibold text-purple-600">{earningsData.overrideCommission}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bet Commission</span>
                    <span className="font-semibold text-green-600">{earningsData.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Deposit Commission</span>
                    <span className="font-semibold text-green-600">{earningsData.depositRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CPA Rate</span>
                    <span className="font-semibold text-green-600">{formatCurrency(earningsData.cpaRate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Earnings;