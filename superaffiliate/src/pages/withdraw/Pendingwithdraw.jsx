import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaSort, FaSortUp, FaSortDown, FaMoneyBill, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaDownload, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Pendingwithdraw = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateTransactionId, setUpdateTransactionId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalAmount: 0,
    completedAmount: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const itemsPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const statuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
  const methods = ['all', 'bkash', 'nagad', 'rocket', 'upay', 'bank_transfer'];

  // Fetch pending withdrawals from API
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status:'pending', // Only fetch pending and processing withdrawals
          method: methodFilter !== 'all' ? methodFilter : undefined,
          search: searchTerm || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          sortBy: sortConfig.key || 'createdAt',
          sortOrder: sortConfig.direction === 'ascending' ? 'asc' : 'desc'
        }
      });

      if (response.data) {
        setWithdrawals(response.data.withdrawals);

        // Calculate statistics
        const totalWithdrawals = response.data.total;
        const completedWithdrawals = response.data.statusCounts?.find(s => s._id === 'completed')?.count || 0;
        const pendingWithdrawals = response.data.statusCounts?.filter(s => 
          ['pending', 'processing'].includes(s._id)
        ).reduce((sum, s) => sum + s.count, 0) || 0;
        const totalAmount = response.data.totalAmount || 0;
        const completedAmount = response.data.statusCounts?.find(s => s._id === 'completed')?.amount || 0;

        setStats({
          total: totalWithdrawals,
          completed: completedWithdrawals,
          pending: pendingWithdrawals,
          totalAmount,
          completedAmount
        });
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setError('Failed to load pending withdrawals. Please try again.');

      // Fallback to sample data if API fails
      setWithdrawals([
        {
          _id: "68ae24b8c2b1c27dfe6572d2",
          userId: { username: "johndoe", player_id: "PID507955" },
          amount: 8000,
          method: "bank_transfer",
          phoneNumber: "1234567890",
          transactionId: "TXW987654321",
          status: "pending",
          createdAt: "2025-08-27T10:15:30.904Z",
          adminNotes: "Waiting for approval"
        },
        {
          _id: "68ae24b8c2b1c27dfe6572d5",
          userId: { username: "abusaid", player_id: "PID507954" },
          amount: 4500,
          method: "bkash",
          phoneNumber: "015*****123",
          transactionId: "TXW159753468",
          status: "processing",
          createdAt: "2025-08-28T09:30:12.904Z",
          adminNotes: "Under review"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawal statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/withdrawals-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          status: ['pending', 'processing'] // Focus on pending and processing stats
        }
      });

      if (response.data.success) {
        setStats({
          total: response.data.total?.totalCount || 0,
          completed: response.data.byStatus?.find(s => s._id === 'completed')?.count || 0,
          pending: response.data.byStatus?.filter(s => 
            ['pending', 'processing'].includes(s._id)
          ).reduce((sum, s) => sum + s.count, 0) || 0,
          totalAmount: response.data.total?.totalAmount || 0,
          completedAmount: response.data.byStatus?.find(s => s._id === 'completed')?.amount || 0
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Update withdrawal status
  const updateWithdrawalStatus = async (withdrawalId, status, transactionId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/withdrawals/${withdrawalId}/status`,
        { status, transactionId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        toast.success('Withdrawal status updated successfully!');
        fetchWithdrawals();
        fetchStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating withdrawal status:', err);
      toast.error('Failed to update withdrawal status. Please try again.');
      return false;
    }
  };

  // Delete withdrawal
  const deleteWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/withdrawals/${withdrawalId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Withdrawal deleted successfully!');
        fetchWithdrawals();
        fetchStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting withdrawal:', err);
      toast.error('Failed to delete withdrawal. Please try again.');
      return false;
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/withdrawals/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          status: ['pending', 'processing'] // Export only pending and processing withdrawals
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pending_withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Failed to export data. Please try again.');
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, [currentPage, methodFilter, searchTerm, dateRange, sortConfig]);

  // Sort withdrawals
  const sortedWithdrawals = React.useMemo(() => {
    let sortableItems = [...withdrawals];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'processedAt') {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        }

        if (sortConfig.key === 'userId') {
          aValue = a.userId?.username || '';
          bValue = b.userId?.username || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [withdrawals, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="text-orange-500" />;
    return <FaSortDown className="text-orange-500" />;
  };

  // View withdrawal details
  const viewWithdrawalDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawalDetails(true);
  };

  // Close withdrawal details modal
  const closeWithdrawalDetails = () => {
    setShowWithdrawalDetails(false);
    setSelectedWithdrawal(null);
  };

  // Open update modal
  const openUpdateModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setUpdateStatus(withdrawal.status);
    setUpdateTransactionId(withdrawal.transactionId || '');
    setShowUpdateModal(true);
  };

  // Close update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedWithdrawal(null);
    setUpdateStatus('');
    setUpdateTransactionId('');
  };

  // Handle update submission
  const handleUpdateSubmit = async () => {
    if (!selectedWithdrawal) return;

    const success = await updateWithdrawalStatus(
      selectedWithdrawal._id,
      updateStatus,
      updateTransactionId || undefined
    );

    if (success) {
      closeUpdateModal();
    }
  };

  // Open delete modal
  const openDeleteModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedWithdrawal(null);
  };

  // Handle delete submission
  const handleDeleteSubmit = async () => {
    if (!selectedWithdrawal) return;

    const success = await deleteWithdrawal(selectedWithdrawal._id);

    if (success) {
      closeDeleteModal();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency (BDT)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch(status) {
      case 'completed':
        return { icon: <FaCheckCircle className="text-green-500" />, color: 'bg-green-100 text-green-800 border-green-200' };
      case 'pending':
        return { icon: <FaClock className="text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'processing':
        return { icon: <FaClock className="text-blue-500" />, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return { icon: <FaTimesCircle className="text-red-500" />, color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { icon: <FaExclamationTriangle className="text-gray-500" />, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Get method display name
  const getMethodName = (method) => {
    switch(method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      case 'upay': return 'Upay';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, methodFilter, dateRange]);

  return (
    <section className="font-nunito h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <Toaster />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pending Withdrawals</h1>
                <p className="text-sm text-gray-600 mt-1">Manage pending and processing withdrawal transactions</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchWithdrawals}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-all"
                  title="Refresh data"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-[5px] hover:from-green-600 hover:to-green-700 transition-all"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Pending</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Completed Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.completedAmount)}</p>
              </div>
            </div>
            
            {/* Filters Section */}
            <div className="bg-white rounded-[5px] p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                  <FaFilter className="mr-2 text-orange-500" />
                  Filters & Search
                </h2>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setMethodFilter('all');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="text-sm text-orange-500 hover:text-orange-600 flex items-center"
                >
                  Clear All Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Search username, ID, account or transaction..."
                  />
                </div>
                
                {/* Method Filter */}
                <div>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Methods</option>
                    {methods.filter(method => method !== 'all').map((method, index) => (
                      <option key={index} value={method}>{getMethodName(method)}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sort by */}
                <div>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={sortConfig.key || ''}
                    onChange={(e) => requestSort(e.target.value)}
                  >
                    <option value="">Sort By</option>
                    <option value="createdAt">Date</option>
                    <option value="amount">Amount</option>
                    <option value="userId">Username</option>
                  </select>
                </div>
              </div>
              
              {/* Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="self-center text-gray-500 hidden md:inline">to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <p className="text-gray-600">
                Showing {withdrawals.length} of {stats.total} pending withdrawals
              </p>
              <p className="text-green-600 font-medium">
                Completed Amount: {formatCurrency(stats.completedAmount)}
              </p>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg p-8 text-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading pending withdrawals...</p>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={fetchWithdrawals}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* Withdrawals Table */}
            {!loading && !error && (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Player ID / Username
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Method
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Account Number
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {withdrawals.length > 0 ? (
                        withdrawals.map((withdrawal) => {
                          const statusInfo = getStatusInfo(withdrawal.status);
                          return (
                            <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">{formatDate(withdrawal.createdAt)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-700 font-mono">{withdrawal.userId?.player_id || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{withdrawal.userId?.username || 'Unknown'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">{getMethodName(withdrawal.method)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                  {withdrawal.phoneNumber || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${statusInfo.color}`}>
                                  {statusInfo.icon}
                                  <span className="ml-1 capitalize">{withdrawal.status}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button 
                                    className="p-2 px-[8px] py-[7px] bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700"
                                    title="View details"
                                    onClick={() => viewWithdrawalDetails(withdrawal)}
                                  >
                                    <FaEye />
                                  </button>
                                  <button 
                                    className="p-2 px-[8px] py-[7px] bg-green-600 text-white rounded-[3px] text-[16px] hover:bg-green-700"
                                    title="Edit status"
                                    onClick={() => openUpdateModal(withdrawal)}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    className="p-2 px-[8px] py-[7px] bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700"
                                    title="Delete withdrawal"
                                    onClick={() => openDeleteModal(withdrawal)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <FaSearch className="text-5xl mb-3 opacity-30" />
                              <p className="text-lg font-medium text-gray-500">No pending withdrawals found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && withdrawals.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, stats.total)}
                      </span> of{' '}
                      <span className="font-medium">{stats.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative cursor-pointer inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1 
                            ? 'bg-gray-50 text-gray-800 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.ceil(stats.total / itemsPerPage) }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(stats.total / itemsPerPage), currentPage + 2))
                        .map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative cursor-pointer inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-orange-500 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(stats.total / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(stats.total / itemsPerPage)}
                        className={`relative cursor-pointer inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === Math.ceil(stats.total / itemsPerPage)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Withdrawal Details Modal */}
      {showWithdrawalDetails && selectedWithdrawal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Pending Withdrawal Details</h3>
              <button onClick={closeWithdrawalDetails} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Transaction ID:</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedWithdrawal.transactionId || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Requested At:</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedWithdrawal.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Payment Method:</dt>
                      <dd className="text-sm text-gray-900">{getMethodName(selectedWithdrawal.method)}</dd>
                    </div>
                    {selectedWithdrawal.processedAt && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Processed At:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedWithdrawal.processedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Player ID:</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedWithdrawal.userId?.player_id || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Username:</dt>
                      <dd className="text-sm text-gray-900">{selectedWithdrawal.userId?.username || 'Unknown'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Amount Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-sm font-medium text-gray-700">Net Amount:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(selectedWithdrawal.amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h4>
                <dl className="space-y-2 bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Method:</dt>
                    <dd className="text-sm text-gray-900">{getMethodName(selectedWithdrawal.method)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Account Number:</dt>
                    <dd className="text-sm font-medium text-gray-900">{selectedWithdrawal.phoneNumber || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                {(() => {
                  const statusInfo = getStatusInfo(selectedWithdrawal.status);
                  return (
                    <div className={`px-4 py-2 inline-flex items-center rounded-md border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-2 capitalize font-medium">{selectedWithdrawal.status}</span>
                    </div>
                  );
                })()}
              </div>

              {selectedWithdrawal.adminNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedWithdrawal.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => openUpdateModal(selectedWithdrawal)}
                className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none"
              >
                Update Status
              </button>
              <button
                onClick={closeWithdrawalDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Update Withdrawal Status</h3>
              <button onClick={closeUpdateModal} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <div className="text-sm text-gray-900">
                  {selectedWithdrawal.userId?.username || 'Unknown'} ({selectedWithdrawal.userId?.player_id || 'N/A'})
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="text-sm text-gray-900">{getMethodName(selectedWithdrawal.method)}</div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <div className="text-sm text-gray-900">{selectedWithdrawal.phoneNumber || 'N/A'}</div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={updateTransactionId}
                  onChange={(e) => setUpdateTransactionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter transaction ID if applicable"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeUpdateModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this pending withdrawal request? This action cannot be undone.
                </p>
              </div>
              
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">Withdrawal Details</h4>
                <div className="text-sm text-red-700">
                  <p>Amount: {formatCurrency(selectedWithdrawal.amount)}</p>
                  <p>User: {selectedWithdrawal.userId?.username || 'Unknown'} ({selectedWithdrawal.userId?.player_id || 'N/A'})</p>
                  <p>Method: {getMethodName(selectedWithdrawal.method)}</p>
                  <p>Status: {selectedWithdrawal.status}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none"
              >
                Delete Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pendingwithdraw;