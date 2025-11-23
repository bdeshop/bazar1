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
  FaMousePointer
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

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

  // Earnings data state
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    availableForPayout: 0,
    commissionRate: 0,
    monthlyGrowth: 0,
    referralCount: 0,
    activeReferrals: 0,
    conversionRate: 0,
    clickCount: 0,
    transactions: [],
    canRequestPayout: false,
    minimumPayout: 50,
    earningsHistory: [],
    earningsSummary: {
      total: 0,
      pending: 0,
      paid: 0,
      byType: {}
    }
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
      const token = localStorage.getItem('affiliatetoken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${base_url}/api/affiliate/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Align with backend response structure
        const { stats, affiliate } = response.data;
        console.log('API Response:', response.data); // Debug log

        const earningsHistory = stats.recentTransactions || [];
        console.log('Earnings History:', earningsHistory); // Debug log

        // Calculate earnings summary
        const earningsSummary = calculateEarningsSummary(earningsHistory);

        // Calculate monthly growth
        const monthlyGrowth = stats.monthlyGrowth || calculateMonthlyGrowth(earningsHistory);

        // Transform earnings history to transactions format
        const transactions = transformEarningsToTransactions(earningsHistory);

        setEarningsData(prev => ({
          ...prev,
          totalEarnings: stats.totalEarnings || 0,
          pendingEarnings: stats.pendingEarnings || 0,
          paidEarnings: stats.paidEarnings || 0,
          commissionRate: stats.commissionRate || 0,
          referralCount: stats.referralCount || 0,
          activeReferrals: stats.activeReferrals || 0,
          conversionRate: stats.conversionRate || 0,
          clickCount: stats.clickCount || 0,
          minimumPayout: stats.minimumPayout || 50,
          canRequestPayout: (stats.pendingEarnings || 0) >= (stats.minimumPayout || 50),
          monthlyGrowth,
          transactions,
          earningsHistory,
          earningsSummary
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch earnings data');
      }
    } catch (error) {
      console.error('Error loading earnings data:', error);
      toast.error(error.message || 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayoutHistory = async () => {
    try {
      const token = localStorage.getItem('affiliatetoken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${base_url}/api/affiliate/payout/history`, {
        params: { page: currentPage, limit: 10 },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPayoutHistory(response.data.history);
      } else {
        throw new Error(response.data.message || 'Failed to fetch payout history');
      }
    } catch (error) {
      console.error('Error loading payout history:', error);
      toast.error(error.message || 'Failed to load payout history');
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

  // Calculate monthly growth percentage
  const calculateMonthlyGrowth = (earningsHistory) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthEarnings = earningsHistory
      .filter(earning => {
        const earningDate = new Date(earning.date || earning.earnedAt);
        return earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear;
      })
      .reduce((total, earning) => total + earning.amount, 0);

    const lastMonthEarnings = earningsHistory
      .filter(earning => {
        const earningDate = new Date(earning.date || earning.earnedAt);
        return earningDate.getMonth() === lastMonth && earningDate.getFullYear() === lastMonthYear;
      })
      .reduce((total, earning) => total + earning.amount, 0);

    if (lastMonthEarnings === 0) {
      return currentMonthEarnings > 0 ? 100 : 0;
    }

    return ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
  };

  // Transform earnings history to transactions format for display
  const transformEarningsToTransactions = (earningsHistory) => {
    return earningsHistory
      .sort((a, b) => new Date(b.date || b.earnedAt) - new Date(a.date || a.earnedAt))
      .map(earning => ({
        id: earning.id || earning._id || `TRX${earning.sourceId}`,
        referralName: getReferralName(earning),
        referralEmail: getReferralEmail(earning),
        date: earning.date || earning.earnedAt,
        daysAgo: Math.floor((new Date() - new Date(earning.date || earning.earnedAt)) / (1000 * 60 * 60 * 24)),
        amount: earning.amount,
        commissionRate: (earning.commissionRate || 0) * 100, // Convert to percentage
        status: earning.status,
        type: earning.type,
        description: earning.description,
        sourceType: earning.sourceType,
        calculatedAmount: earning.calculatedAmount,
        sourceAmount: earning.sourceAmount,
        metadata: earning.metadata
      }));
  };

  const getReferralName = (earning) => {
    return `User ${earning.referredUser?.toString().slice(-6) || 'Unknown'}`;
  };

  const getReferralEmail = (earning) => {
    return `user${earning.referredUser?.toString().slice(-6) || 'unknown'}@example.com`;
  };

  const getEarningTypeLabel = (type) => {
    const typeLabels = {
      deposit_commission: 'Deposit Commission',
      bet_commission: 'Bet Commission',
      withdrawal_commission: 'Withdrawal Commission',
      registration_bonus: 'Registration Bonus',
      cpa: 'CPA',
      other: 'Other'
    };
    return typeLabels[type] || type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
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
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
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
      deposit_commission: { color: 'bg-blue-100 text-blue-800', label: 'Deposit' },
      bet_commission: { color: 'bg-purple-100 text-purple-800', label: 'Bet' },
      withdrawal_commission: { color: 'bg-orange-100 text-orange-800', label: 'Withdrawal' },
      registration_bonus: { color: 'bg-green-100 text-green-800', label: 'Bonus' },
      cpa: { color: 'bg-indigo-100 text-indigo-800', label: 'CPA' },
      other: { color: 'bg-gray-100 text-gray-800', label: 'Other' }
    };

    const config = typeConfig[type] || typeConfig.other;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const exportToCSV = () => {
    toast.success('Export feature coming soon!');
  };

  const handlePayoutRequest = async () => {
    try {
      const token = localStorage.getItem('affiliatetoken');
      const response = await axios.post(`${base_url}/api/affiliate/payout/request`, {
        amount: earningsData.pendingEarnings
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Payout request submitted successfully!');
        loadEarningsData();
        loadPayoutHistory();
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

  const filteredTransactions = earningsData.transactions.filter(transaction => {
    const matchesSearch =
      (transaction.referralName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(payoutHistory.total / payoutHistory.limit);

  return (
    <div className="min-h-screen">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-20">
        <Sidebar isOpen={isSidebarOpen} />

        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900">Earnings Overview</h1>
                  <p className="text-gray-600 mt-2 text-[13px]">
                    Track your commissions and referral earnings
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
                    className={`px-4 py-2 rounded-[5px] cursor-pointer font-medium transition-all duration-300 ${
                      timeRange === range.value
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(earningsData.totalEarnings)}
                    </p>
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <FaChartLine className="mr-1" />
                      +{earningsData.monthlyGrowth.toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(earningsData.pendingEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Awaiting clearance</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <FaRegClock className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(earningsData.paidEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Successfully paid out</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaCheckCircle className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(earningsData.commissionRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Per successful referral</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaChartLine className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {earningsData.referralCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Active: {earningsData.activeReferrals}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <FaUsers className="text-indigo-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {earningsData.conversionRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Click to registration</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaUserPlus className="text-orange-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {earningsData.clickCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Affiliate link clicks</p>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <FaMousePointer className="text-pink-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Eligibility Card */}
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-[5px] p-6 mb-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
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
                      className="px-6 py-3 bg-white text-green-600 rounded-[5px] cursor-pointer mt-1 font-semibold hover:bg-gray-100 transition-colors shadow-md"
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
                        className="px-6 py-2 mt-1 bg-white/50 text-white rounded-[5px] font-[500] text-[14px] cursor-not-allowed"
                      >
                        Request Payout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[5px] border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-[600] text-gray-900 mb-4 lg:mb-0">Earnings History</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search earnings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <p className="text-gray-600 mt-4">Loading earnings history...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">No earnings history found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Your earnings will appear here'}
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(transaction.date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.daysAgo === 0 ? 'Today' : `${transaction.daysAgo}d ago`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getTypeBadge(transaction.type)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getEarningTypeLabel(transaction.type)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.description || 'Commission earned'}
                                </div>
                                {transaction.metadata && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {transaction.metadata.betType && `Bet: ${transaction.metadata.betType}`}
                                    {transaction.metadata.depositMethod &&
                                      `Deposit: ${transaction.metadata.depositMethod}`}
                                    {transaction.metadata.withdrawalMethod &&
                                      `Withdrawal: ${transaction.metadata.withdrawalMethod}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.commissionRate.toFixed(1)}% of{' '}
                              {formatCurrency(transaction.sourceAmount)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Earnings Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(earningsData.earningsSummary.byType).map(([type, data]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            type === 'bet_commission'
                              ? 'bg-purple-500'
                              : type === 'deposit_commission'
                              ? 'bg-blue-500'
                              : type === 'withdrawal_commission'
                              ? 'bg-orange-500'
                              : type === 'registration_bonus'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}
                        ></div>
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

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Structure</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bet Commission</span>
                    <span className="font-semibold text-green-600">
                      {(earningsData.commissionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Deposit Commission</span>
                    <span className="font-semibold text-green-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CPA Rate</span>
                    <span className="font-semibold text-green-600">{formatCurrency(200)}</span>
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