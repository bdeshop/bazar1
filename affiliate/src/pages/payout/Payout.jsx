import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaFilter,
  FaSearch,
  FaPlus,
  FaEye,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaHistory,
  FaQrcode,
  FaCopy,
  FaWallet,
  FaMobileAlt
} from 'react-icons/fa';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { GiMoneyStack } from 'react-icons/gi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Payout = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [chartTimeRange, setChartTimeRange] = useState('month');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [payoutData, setPayoutData] = useState({
    availableBalance: 0,
    pendingEarnings: 0,
    totalPaid: 0,
    minimumPayout: 1000,
    nextPayoutDate: '',
    payoutHistory: {
      payouts: [],
      summary: {},
      pagination: {}
    },
    paymentMethods: [],
    payoutStats: {},
    chartData: []
  });

  const [payoutRequest, setPayoutRequest] = useState({
    amount: '',
    paymentMethod: '',
    notes: ''
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    loadPayoutData();
  }, [chartTimeRange, currentPage]);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');

      const profileResponse = await axios.get(`${base_url}/api/master-affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const historyResponse = await axios.get(`${base_url}/api/master-affiliate/payout/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: itemsPerPage }
      });
         console.log(historyResponse);
      if (profileResponse.data.success) {
        const profile = profileResponse.data.affiliate;
        const history = historyResponse.data.success ? historyResponse.data : { payouts: [], pagination: {} };

        const paymentMethods = [
          {
            id: 'bkash',
            name: 'bKash',
            type: 'mobile',
            icon: FaMobileAlt,
            details: profile.paymentDetails?.bkash || {},
            isPrimary: profile.paymentMethod === 'bkash',
            isConfigured: !!profile.paymentDetails?.bkash?.phoneNumber
          },
          {
            id: 'nagad',
            name: 'Nagad',
            type: 'mobile',
            icon: FaMobileAlt,
            details: profile.paymentDetails?.nagad || {},
            isPrimary: profile.paymentMethod === 'nagad',
            isConfigured: !!profile.paymentDetails?.nagad?.phoneNumber
          },
          {
            id: 'rocket',
            name: 'Rocket',
            type: 'mobile',
            icon: FaMobileAlt,
            details: profile.paymentDetails?.rocket || {},
            isPrimary: profile.paymentMethod === 'rocket',
            isConfigured: !!profile.paymentDetails?.rocket?.phoneNumber
          },
          {
            id: 'binance',
            name: 'Binance',
            type: 'crypto',
            icon: FaWallet,
            details: profile.paymentDetails?.binance || {},
            isPrimary: profile.paymentMethod === 'binance',
            isConfigured: !!(profile.paymentDetails?.binance?.walletAddress || profile.paymentDetails?.binance?.email)
          },
          {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            type: 'bank',
            icon: GiMoneyStack,
            details: profile.paymentDetails?.bank_transfer || {},
            isPrimary: profile.paymentMethod === 'bank_transfer',
            isConfigured: !!(profile.paymentDetails?.bank_transfer?.accountNumber && profile.paymentDetails?.bank_transfer?.bankName)
          }
        ];

        const stats = calculatePayoutStats(history, profile);
        const chartData = generateChartData(history.payouts, chartTimeRange);

        setPayoutData({
          availableBalance: profile.pendingEarnings || 0,
          pendingEarnings: profile.pendingEarnings || 0,
          totalPaid: profile.paidEarnings || 0,
          minimumPayout: profile.minimumPayout || 1000,
          nextPayoutDate: calculateNextPayoutDate(profile.payoutSchedule),
          payoutHistory: history,
          paymentMethods,
          payoutStats: stats,
          chartData
        });

        const primaryMethod = paymentMethods.find(m => m.isPrimary && m.isConfigured) ||
                              paymentMethods.find(m => m.isConfigured);
        if (primaryMethod) {
          setPayoutRequest(prev => ({
            ...prev,
            paymentMethod: primaryMethod.id
          }));
        }
      }
    } catch (error) {
      console.error('Error loading payout data:', error);
      // Don't set mock data, let the user see the error
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (payouts, timeRange) => {
    const now = new Date();
    let startDate = new Date();
    let days;

    switch (timeRange) {
      case 'week':
        days = 7;
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        days = 30;
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        days = 90;
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        days = 30;
        startDate.setDate(now.getDate() - 30);
    }

    const amounts = Array(days).fill(0);
    const dates = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    payouts.forEach(payout => {
      const requestedDate = new Date(payout.requestedAt);
      if (requestedDate >= startDate && payout.status === 'completed') {
        const dayIndex = Math.floor((requestedDate - startDate) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < days) {
          amounts[dayIndex] += payout.netAmount || payout.amount;
        }
      }
    });

    return dates.map((date, index) => ({
      date,
      amount: amounts[index]
    }));
  };

  const calculatePayoutStats = (history, profile) => {
    const payouts = history.payouts || [];
    const completedPayouts = payouts.filter(p => p.status === 'completed');
    const totalAmount = completedPayouts.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);
    const averagePayout = completedPayouts.length > 0 ? totalAmount / completedPayouts.length : 0;
    const largestPayout = completedPayouts.length > 0 ? Math.max(...completedPayouts.map(p => p.netAmount || p.amount)) : 0;

    return {
      totalPayouts: payouts.length,
      totalAmount,
      completedPayouts: completedPayouts.length,
      pendingPayouts: payouts.filter(p => p.status === 'pending').length,
      averagePayout,
      largestPayout,
      availableForPayout: profile.pendingEarnings || 0,
      minimumPayout: profile.minimumPayout || 1000,
      canRequestPayout: (profile.pendingEarnings || 0) >= (profile.minimumPayout || 1000)
    };
  };

  const calculateNextPayoutDate = (schedule = 'manual') => {
    const now = new Date();
    let nextDate;

    switch (schedule) {
      case 'weekly':
        nextDate = new Date(now.setDate(now.getDate() + 7));
        break;
      case 'bi_weekly':
        nextDate = new Date(now.setDate(now.getDate() + 14));
        break;
      case 'monthly':
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
        break;
      default:
        nextDate = new Date(now.setDate(now.getDate() + 1));
    }

    return nextDate.toISOString().split('T')[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: FaCheckCircle,
        label: 'Completed'
      },
      processing: {
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: FaClock,
        label: 'Processing'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: FaClock,
        label: 'Pending'
      },
      failed: {
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: FaTimesCircle,
        label: 'Failed'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: FaTimesCircle,
        label: 'Cancelled'
      },
      on_hold: {
        color: 'bg-orange-100 text-orange-800 border border-orange-200',
        icon: FaExclamationTriangle,
        label: 'On Hold'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const amount = parseFloat(payoutRequest.amount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    if (amount < payoutData.minimumPayout) {
      toast.error(`Minimum payout amount is ${formatCurrency(payoutData.minimumPayout)}`);
      return;
    }

    if (amount > payoutData.availableBalance) {
      toast.error('Insufficient available balance');
      return;
    }

    if (!payoutRequest.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    const selectedMethod = payoutData.paymentMethods.find(m => m.id === payoutRequest.paymentMethod);
    if (!selectedMethod?.isConfigured) {
      toast.error('Selected payment method is not properly configured');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.post(`${base_url}/api/master-affiliate/payout/request`, {
        amount,
        notes: payoutRequest.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Payout request submitted successfully!');
        setShowRequestModal(false);
        setPayoutRequest({ amount: '', paymentMethod: '', notes: '' });
        await loadPayoutData();
      }
    } catch (error) {
      console.error('Payout request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit payout request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPayout = async (payoutId) => {
    if (!confirm('Are you sure you want to cancel this payout request?')) return;

    try {
      const token = localStorage.getItem('masterAffiliateToken');
      const response = await axios.post(`${base_url}/api/master-affiliate/payout/${payoutId}/cancel`, {
        reason: 'Cancelled by user'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Payout request cancelled successfully!');
        await loadPayoutData();
      }
    } catch (error) {
      console.error('Cancel payout error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel payout request');
    }
  };

  const exportToCSV = () => {
    const headers = ['Payout ID', 'Amount', 'Method', 'Status', 'Requested Date', 'Completed Date'];
    const rows = filteredPayouts.map(payout => [
      payout.payoutId,
      formatCurrency(payout.netAmount || payout.amount),
      getPaymentMethodDisplay(payout.paymentMethod),
      payout.status,
      formatDate(payout.requestedAt),
      formatDate(payout.completedAt || '')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payout_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Payout history exported successfully!');
  };

  const viewPayoutDetails = async (payout) => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      
      // Validate that payout._id exists and is a valid MongoDB ObjectId
      if (!payout._id || typeof payout._id !== 'string' || payout._id.length !== 24) {
        console.error('Invalid payout ID:', payout._id);
        setSelectedPayout(payout);
        setShowDetailsModal(true);
        return;
      }

      const response = await axios.get(`${base_url}/api/master-affiliate/payout/${payout._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedPayout(response.data.payout);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching payout details:', error);
      // Fallback to basic payout data if API call fails
      setSelectedPayout(payout);
      setShowDetailsModal(true);
    }
  };

  const copyToClipboard = (text, label = 'text') => {
    if (!text) {
      toast.error('No text to copy');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    });
  };

  const getPaymentMethodIcon = (methodId) => {
    const method = payoutData.paymentMethods.find(m => m.id === methodId);
    const IconComponent = method?.icon || FaWallet;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPaymentMethodDisplay = (methodId) => {
    const method = payoutData.paymentMethods.find(m => m.id === methodId);
    return method?.name || methodId;
  };

  const filteredPayouts = payoutData.payoutHistory.payouts?.filter(payout => {
    const matchesSearch = payout.payoutId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payout.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getPaymentMethodDisplay(payout.paymentMethod).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all' && payout.requestedAt) {
      const now = new Date();
      const payoutDate = new Date(payout.requestedAt);

      switch (dateFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = payoutDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = payoutDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = payoutDate >= quarterAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const canRequestPayout = payoutData.availableBalance >= payoutData.minimumPayout;
  const configuredMethods = payoutData.paymentMethods.filter(method => method.isConfigured);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const totalPages = payoutData.payoutHistory.pagination?.pages || 1;
    const currentPage = payoutData.payoutHistory.pagination?.page || 1;
    const totalItems = payoutData.payoutHistory.pagination?.total || 0;

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-green-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-16">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`flex-1 p-8 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900 flex items-center">
                    <FaBangladeshiTakaSign className="text-green-600 mr-3" />
                    Payout Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-[13px]">
                    Request and track your affiliate earnings in BDT
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <button
                    onClick={() => setShowRequestModal(true)}
                    disabled={!canRequestPayout || configuredMethods.length === 0}
                    className={`px-6 py-3 rounded-[5px] font-[500] text-[14px] cursor-pointer transition-colors flex items-center space-x-2 ${
                      canRequestPayout && configuredMethods.length > 0
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaMoneyBillWave className="w-4 h-4" />
                    <span>Request Payout</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(payoutData.availableBalance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Ready for payout
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <FaMoneyBillWave className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(payoutData.totalPaid)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Lifetime earnings
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FaCheckCircle className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Minimum Payout</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(payoutData.minimumPayout)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Required amount
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <FaBangladeshiTakaSign className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-[5px] p-6 mb-8 ${
              canRequestPayout && configuredMethods.length > 0
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                : configuredMethods.length === 0
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {canRequestPayout && configuredMethods.length > 0 ? (
                      <FaMoneyBillWave className="text-2xl" />
                    ) : configuredMethods.length === 0 ? (
                      <FaExclamationTriangle className="text-2xl" />
                    ) : (
                      <FaExclamationTriangle className="text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {canRequestPayout && configuredMethods.length > 0
                        ? 'Ready for Payout!'
                        : configuredMethods.length === 0
                        ? 'Payment Method Required'
                        : 'Minimum Not Reached'
                      }
                    </h3>
                    <p className="opacity-90">
                      {canRequestPayout && configuredMethods.length > 0
                        ? `You can request up to ${formatCurrency(payoutData.availableBalance)}`
                        : configuredMethods.length === 0
                        ? 'Please configure your payment method in profile settings'
                        : `You need ${formatCurrency(payoutData.minimumPayout - payoutData.availableBalance)} more to request a payout`
                      }
                    </p>
                  </div>
                </div>
                {canRequestPayout && configuredMethods.length > 0 && (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="mt-4 lg:mt-0 px-6 py-3 bg-white text-green-600 rounded-[5px] text-[14px] font-[500] hover:bg-gray-100 transition-colors"
                  >
                    Request Payout Now
                  </button>
                )}
                {configuredMethods.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/master-affiliate/profile'}
                    className="mt-4 lg:mt-0 px-6 py-3 bg-white text-red-600 rounded-[5px] text-[14px] font-[500] cursor-pointer transition-colors"
                  >
                    Configure Payment Method
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[5px] border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 cursor-pointer hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Payout History
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                      activeTab === 'stats'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Statistics
                  </button>
                  <button
                    onClick={() => setActiveTab('methods')}
                    className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                      activeTab === 'methods'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Payment Methods
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'history' && (
                  <div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">
                        Payout History
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by ID or method..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
                          />
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          <option value="completed">Completed</option>
                          <option value="processing">Processing</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="all">All Time</option>
                          <option value="week">Last 7 Days</option>
                          <option value="month">Last 30 Days</option>
                          <option value="quarter">Last 90 Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {filteredPayouts.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-600">No payout history found</p>
                          <p className="text-gray-500 text-sm mt-2">
                            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Your payout history will appear here'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Payout ID
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Method
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Requested Date
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPayouts.map((payout) => (
                                <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 font-mono">
                                      {payout.payoutId}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(payout.netAmount || payout.amount)}
                                    </div>
                                    {payout.netAmount !== payout.amount && (
                                      <div className="text-xs text-gray-500 line-through">
                                        {formatCurrency(payout.amount)}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                      {getPaymentMethodIcon(payout.paymentMethod)}
                                      <span className="text-sm text-gray-900 capitalize">
                                        {getPaymentMethodDisplay(payout.paymentMethod)}
                                      </span>
                                    </div>
                                    {payout.paymentDetails && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        {payout.paymentDetails[payout.paymentMethod]?.phoneNumber ||
                                         payout.paymentDetails[payout.paymentMethod]?.walletAddress?.slice(0, 8) + '...'}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(payout.status)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(payout.requestedAt)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => viewPayoutDetails(payout)}
                                        className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                                      >
                                        <FaEye className="w-4 h-4" />
                                        <span>View</span>
                                      </button>
                                      {payout.status === 'pending' && (
                                        <button
                                          onClick={() => handleCancelPayout(payout._id)}
                                          className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                                        >
                                          <FaTimesCircle className="w-4 h-4" />
                                          <span>Cancel</span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {renderPagination()}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 lg:mb-0">
                        Payout Statistics
                      </h2>
                      <select
                        value={chartTimeRange}
                        onChange={(e) => setChartTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 90 Days</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Payouts:</span>
                            <span className="font-semibold">{payoutData.payoutStats.totalPayouts || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-semibold text-green-600">{payoutData.payoutStats.completedPayouts || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-semibold text-yellow-600">{payoutData.payoutStats.pendingPayouts || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold">{formatCurrency(payoutData.payoutStats.totalAmount || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Averages</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Payout:</span>
                            <span className="font-semibold">{formatCurrency(payoutData.payoutStats.averagePayout || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Largest Payout:</span>
                            <span className="font-semibold">{formatCurrency(payoutData.payoutStats.largestPayout || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="font-semibold">
                              {payoutData.payoutStats.totalPayouts
                                ? Math.round(((payoutData.payoutStats.completedPayouts || 0) / payoutData.payoutStats.totalPayouts) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowRequestModal(true)}
                            disabled={!canRequestPayout}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                              canRequestPayout
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Request Payout
                          </button>
                          <button
                            onClick={exportToCSV}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Export History
                          </button>
                          <button
                            onClick={() => window.location.href = '/master-affiliate/profile'}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Manage Payment Methods
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[5px] border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Trends</h3>
                      {payoutData.chartData.length === 0 ? (
                        <p className="text-gray-600 text-center">No payout data available for the selected period</p>
                      ) : (
                        <div style={{ height: '300px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={payoutData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" />
                              <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '5px' }}
                              />
                              <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#16a34a"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'methods' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {payoutData.paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border-2 rounded-xl p-6 transition-all ${
                            method.isConfigured
                              ? method.isPrimary
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                              : 'border-gray-200 bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                method.isConfigured
                                  ? method.isPrimary
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                                  : 'bg-gray-200 text-gray-400'
                              }`}>
                                {React.createElement(method.icon, { className: "w-5 h-5" })}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                <p className={`text-sm ${
                                  method.isConfigured ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {method.isConfigured ? 'Configured' : 'Not Configured'}
                                  {method.isPrimary && ' • Primary'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {method.isConfigured && (
                            <div className="space-y-2 text-sm text-gray-600">
                              {method.details.phoneNumber && (
                                <div className="flex justify-between">
                                  <span>Phone:</span>
                                  <span className="font-mono">{method.details.phoneNumber}</span>
                                </div>
                              )}
                              {method.details.walletAddress && (
                                <div className="flex justify-between">
                                  <span>Wallet:</span>
                                  <span className="font-mono text-xs">
                                    {method.details.walletAddress.slice(0, 8)}...{method.details.walletAddress.slice(-8)}
                                  </span>
                                </div>
                              )}
                              {method.details.accountType && (
                                <div className="flex justify-between">
                                  <span>Type:</span>
                                  <span className="capitalize">{method.details.accountType}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-4">
                            <button
                              onClick={() => window.location.href = '/master-affiliate/profile'}
                              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                                method.isConfigured
                                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {method.isConfigured ? 'Edit' : 'Configure'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] font-poppins bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[10px] max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Request Payout</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handlePayoutRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount (BDT)
                </label>
                <div className="relative">
                  <FaBangladeshiTakaSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={payoutRequest.amount}
                    onChange={(e) => setPayoutRequest(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder={`Minimum: ${formatCurrency(payoutData.minimumPayout)}`}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min={payoutData.minimumPayout}
                    max={payoutData.availableBalance}
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {formatCurrency(payoutData.availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={payoutRequest.paymentMethod}
                  onChange={(e) => setPayoutRequest(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select payment method</option>
                  {payoutData.paymentMethods
                    .filter(method => method.isConfigured)
                    .map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name} {method.isPrimary && '(Primary)'}
                      </option>
                    ))
                  }
                </select>
                {configuredMethods.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No payment methods configured. Please set up a payment method in your profile.
                  </p>
                )}
              </div>

              {payoutRequest.paymentMethod && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Details:</p>
                  {payoutData.paymentMethods
                    .find(m => m.id === payoutRequest.paymentMethod)
                    ?.details.phoneNumber && (
                    <p className="text-sm text-gray-600">
                      Phone: {payoutData.paymentMethods.find(m => m.id === payoutRequest.paymentMethod)?.details?.phoneNumber}
                    </p>
                  )}
                  {payoutData.paymentMethods
                    .find(m => m.id === payoutRequest.paymentMethod)
                    ?.details.walletAddress && (
                    <p className="text-sm text-gray-600 break-all">
                      Wallet: {payoutData.paymentMethods.find(m => m.id === payoutRequest.paymentMethod)?.details.walletAddress}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={payoutRequest.notes}
                  onChange={(e) => setPayoutRequest(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes for this payout request..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-[5px] cursor-pointer text-[15px] font-[500] hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-[5px] text-[15px] cursor-pointer font-[500] hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Payout Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payout ID</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedPayout.payoutId}
                        </p>
                        <button
                          onClick={() => copyToClipboard(selectedPayout.payoutId, 'Payout ID')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedPayout.transactionId || 'Pending assignment'}
                        </p>
                        {selectedPayout.transactionId && (
                          <button
                            onClick={() => copyToClipboard(selectedPayout.transactionId, 'Transaction ID')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatCurrency(selectedPayout.netAmount || selectedPayout.amount)}
                      </p>
                      {selectedPayout.netAmount !== selectedPayout.amount && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatCurrency(selectedPayout.amount)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedPayout.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(selectedPayout.requestedAt)}
                      </p>
                    </div>
                    {selectedPayout.completedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Completed Date</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDate(selectedPayout.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getPaymentMethodIcon(selectedPayout.paymentMethod)}
                        <p className="text-sm text-gray-900 capitalize">
                          {getPaymentMethodDisplay(selectedPayout.paymentMethod)}
                        </p>
                      </div>
                    </div>
                    {selectedPayout.paymentDetails && (
                      <>
                        {selectedPayout.paymentDetails[selectedPayout.paymentMethod]?.phoneNumber && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm text-gray-900">
                                {selectedPayout.paymentDetails[selectedPayout.paymentMethod].phoneNumber}
                              </p>
                              <button
                                onClick={() => copyToClipboard(
                                  selectedPayout.paymentDetails[selectedPayout.paymentMethod].phoneNumber,
                                  'Phone number'
                                )}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FaCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedPayout.paymentDetails[selectedPayout.paymentMethod]?.walletAddress && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm text-gray-900 font-mono break-all">
                                {selectedPayout.paymentDetails[selectedPayout.paymentMethod].walletAddress}
                              </p>
                              <button
                                onClick={() => copyToClipboard(
                                  selectedPayout.paymentDetails[selectedPayout.paymentMethod].walletAddress,
                                  'Wallet address'
                                )}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FaCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedPayout.paymentDetails[selectedPayout.paymentMethod]?.accountType && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Account Type</label>
                            <p className="text-sm text-gray-900 mt-1 capitalize">
                              {selectedPayout.paymentDetails[selectedPayout.paymentMethod].accountType}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {selectedPayout.includedEarnings && selectedPayout.includedEarnings.length > 0 && (
                    <div className="mt-6">
                      <h5 className="text-md font-medium text-gray-900 mb-3">Included Earnings</h5>
                      <div className="space-y-2">
                        {selectedPayout.includedEarnings.slice(0, 5).map((earning, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{earning.description || 'Commission'}</span>
                            <span className="font-medium">{formatCurrency(earning.amount)}</span>
                          </div>
                        ))}
                        {selectedPayout.includedEarnings.length > 5 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{selectedPayout.includedEarnings.length - 5} more earnings
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedPayout.status === 'pending' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      This payout request is being processed. It usually takes 2-3 business days to complete.
                    </p>
                  </div>
                </div>
              )}

              {selectedPayout.status === 'processing' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Your payout is being processed. You should receive it within 24-48 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                {selectedPayout.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleCancelPayout(selectedPayout._id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Cancel Payout
                  </button>
                )}
                <div className="ml-auto">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payout;