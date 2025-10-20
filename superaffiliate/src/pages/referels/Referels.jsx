import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaUserPlus, 
  FaChartLine, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaEye,
  FaDownload,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Referrals = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Referrals data state
  const [referralsData, setReferralsData] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    referrals: [],
    stats: {
      today: { signups: 0, earnings: 0 },
      week: { signups: 0, earnings: 0 },
      month: { signups: 0, earnings: 0 }
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load referrals data
  useEffect(() => {
    loadReferralsData();
  }, []);

  const loadReferralsData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('affiliatetoken');
      
      // Load profile for basic stats
      const profileResponse = await axios.get(`${base_url}/api/affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const profile = profileResponse.data.affiliate;
        
        // Extract referred users from profile
        const referredUsers = profile.referredUsers || [];
        
        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Process referred users data
        const processedReferrals = referredUsers.map((ref, index) => {
          // Handle nested date objects properly
          const joinedAt = ref.joinedAt?.$date ? new Date(ref.joinedAt.$date) : 
                          ref.createdAt?.$date ? new Date(ref.createdAt.$date) : new Date();
          
          const lastActivity = ref.lastActivity?.$date ? new Date(ref.lastActivity.$date) : joinedAt;
          
          return {
            id: ref._id?.$oid || `ref-${index}`,
            name: ref.user?.firstName && ref.user?.lastName ? 
                  `${ref.user.firstName} ${ref.user.lastName}`.trim() : 
                  'Unknown User',
            email: ref.user?.email || 'No email',
            phone: ref.user?.phone || 'No phone',
            country: ref.user?.address?.country || 'Unknown',
            status: ref.userStatus || 'pending',
            joinedAt: joinedAt,
            lastActivity: lastActivity,
            totalEarned: ref.earnedAmount || 0,
            totalDeposits: 0, // You might need to fetch this from another endpoint
            totalBets: 0, // You might need to fetch this from another endpoint
            conversionValue: ref.earnedAmount || 0,
            source: 'Direct'
          };
        });

        // Calculate time-based stats
        const todaySignups = processedReferrals.filter(user => 
          user.joinedAt.toDateString() === today.toDateString()
        ).length;

        const weekSignups = processedReferrals.filter(user => 
          user.joinedAt >= weekAgo
        ).length;

        const todayEarnings = processedReferrals
          .filter(user => user.joinedAt.toDateString() === today.toDateString())
          .reduce((sum, user) => sum + (user.totalEarned || 0), 0);

        const weekEarnings = processedReferrals
          .filter(user => user.joinedAt >= weekAgo)
          .reduce((sum, user) => sum + (user.totalEarned || 0), 0);

        const monthEarnings = processedReferrals
          .filter(user => user.joinedAt >= monthAgo)
          .reduce((sum, user) => sum + (user.totalEarned || 0), 0);

        setReferralsData({
          totalReferrals: profile.referralCount || 0,
          activeReferrals: profile.activeReferrals || 0,
          pendingReferrals: processedReferrals.filter(user => user.status === 'pending').length,
          totalEarnings: profile.totalEarnings || 0,
          referrals: processedReferrals,
          stats: {
            today: {
              signups: todaySignups,
              earnings: todayEarnings
            },
            week: {
              signups: weekSignups,
              earnings: weekEarnings
            },
            month: {
              signups: profile.referralCount || 0,
              earnings: monthEarnings
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading referrals data:', error);
      toast.error('Failed to load referrals data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: FaUserCheck },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaUserClock },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: FaUserTimes }
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-green-600" /> : <FaSortDown className="text-green-600" />;
  };

  const filteredAndSortedReferrals = referralsData.referrals
    .filter(referral => {
      const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           referral.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           referral.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const referralDate = new Date(referral.joinedAt);
        
        switch (dateFilter) {
          case 'today':
            matchesDate = referralDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = referralDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = referralDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'joinedAt' || sortField === 'lastActivity') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Status', 'Joined At', 'Last Activity', 'Total Earned', 'Total Bets', 'Total Deposits', 'Conversion Value', 'Source'];
    const data = filteredAndSortedReferrals.map(referral => [
      referral.name,
      referral.email,
      referral.phone,
      referral.country,
      referral.status,
      formatDate(referral.joinedAt),
      formatDate(referral.lastActivity),
      formatCurrency(referral.totalEarned),
      referral.totalBets,
      formatCurrency(referral.totalDeposits),
      formatCurrency(referral.conversionValue),
      referral.source
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'referrals_export.csv';
    link.click();
    toast.success('Referrals exported successfully!');
  };

  const viewReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const getActivityLevel = (lastActivity) => {
    if (!lastActivity) return { level: 'Unknown', color: 'text-gray-600' };
    
    const daysSinceActivity = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity <= 1) return { level: 'High', color: 'text-green-600' };
    if (daysSinceActivity <= 7) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
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
    <div className="min-h-screen ">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900">
                    Referral Network
                  </h1>
                  <p className="text-gray-600 mt-2 text-[13px]">
                    Manage and track your referred users
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {referralsData.totalReferrals}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      All time referrals
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaUserPlus className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6  border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {referralsData.activeReferrals}
                    </p>
                    <p className="text-xs text-green-600 mt-2 flex items-center">
                      <FaChartLine className="mr-1" />
                      {referralsData.totalReferrals > 0 
                        ? ((referralsData.activeReferrals / referralsData.totalReferrals) * 100).toFixed(1) 
                        : 0}% active rate
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaUserCheck className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(referralsData.totalEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      From referrals
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaMoneyBillWave className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6  border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {referralsData.pendingReferrals}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Awaiting verification
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <FaUserClock className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[5px] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Today</p>
                    <p className="text-2xl font-bold mt-1">{referralsData.stats.today.signups} Signups</p>
                    <p className="text-sm opacity-80 mt-2">{formatCurrency(referralsData.stats.today.earnings)} Earned</p>
                  </div>
                  <FaCalendarAlt className="text-2xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-[5px] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">This Week</p>
                    <p className="text-2xl font-bold mt-1">{referralsData.stats.week.signups} Signups</p>
                    <p className="text-sm opacity-80 mt-2">{formatCurrency(referralsData.stats.week.earnings)} Earned</p>
                  </div>
                  <FaChartLine className="text-2xl opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-[5px] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">This Month</p>
                    <p className="text-2xl font-bold mt-1">{referralsData.stats.month.signups} Signups</p>
                    <p className="text-sm opacity-80 mt-2">{formatCurrency(referralsData.stats.month.earnings)} Earned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-white rounded-[5px] border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-[600] text-gray-900 mb-4 lg:mb-0">
                    Referral Details ({filteredAndSortedReferrals.length})
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search referrals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-full sm:w-64"
                      />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    {/* Date Filter */}
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('joinedAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Joined</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('totalEarned')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Earned</span>
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('lastActivity')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Last Activity</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedReferrals.map((referral) => {
                      const activityLevel = getActivityLevel(referral.lastActivity);
                      
                      return (
                        <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(referral.joinedAt)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Source: {referral.source}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(referral.totalEarned)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {referral.totalBets} bets
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(referral.lastActivity)}
                            </div>
                            <div className={`text-xs font-medium ${activityLevel.color}`}>
                              {activityLevel.level} activity
                            </div>
                          </td>
               
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredAndSortedReferrals.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">No referrals found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Your referrals will appear here'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredAndSortedReferrals.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{' '}
                      <span className="font-medium">{filteredAndSortedReferrals.length}</span> of{' '}
                      <span className="font-medium">{filteredAndSortedReferrals.length}</span> results
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Referral Details Modal */}
      {showDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Referral Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReferral.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedReferral.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedReferral.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedReferral.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Activity & Earnings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedReferral.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDateTime(selectedReferral.joinedAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDateTime(selectedReferral.lastActivity)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Earned</label>
                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {formatCurrency(selectedReferral.totalEarned)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedReferral.totalBets}</p>
                    <p className="text-sm text-gray-600">Total Bets</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedReferral.totalDeposits)}</p>
                    <p className="text-sm text-gray-600">Total Deposits</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedReferral.conversionValue)}</p>
                    <p className="text-sm text-gray-600">Conversion Value</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{selectedReferral.source}</p>
                    <p className="text-sm text-gray-600">Source</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;