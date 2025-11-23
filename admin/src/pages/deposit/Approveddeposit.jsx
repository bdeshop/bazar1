import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaSort, FaSortUp, FaSortDown, FaMoneyBill, FaCheckCircle, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';

const Approveddeposit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    approvedAmount: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const itemsPerPage = 10;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const methods = ['all', 'bkash', 'nagad', 'rocket', 'upay', 'bank', 'card'];

  // Fetch approved deposits from API
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let url = `${API_BASE_URL}/api/admin/deposits?page=${currentPage}&limit=${itemsPerPage}&status=completed`;

      // Add filters to URL
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (methodFilter !== 'all') params.append('method', methodFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDeposits(response.data.deposits);
      setStats({
        total: response.data.total,
        totalAmount: response.data.totalAmount,
        approvedAmount: response.data.statusCounts.find(s => s._id === 'approved')?.amount || 0
      });
    } catch (err) {
      console.error('Error fetching approved deposits:', err);
      setError('Failed to load approved deposits. Please try again.');

      // Fallback to sample data if API fails
      setDeposits([
        {
          _id: "68ae24b8c2b1c27dfe6572c1",
          userId: { username: "abusaid", player_id: "PID507954" },
          amount: 5000,
          method: "bkash",
          phoneNumber: "01712345678",
          transactionId: "TX789456123",
          status: "approved",
          createdAt: "2025-08-26T21:18:48.904Z",
          processedAt: "2025-08-26T21:25:48.904Z",
          adminNotes: "Initial deposit"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch deposit statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/deposits-stats?status=approved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStats(prev => ({
        ...prev,
        total: response.data.total.totalCount,
        totalAmount: response.data.total.totalAmount,
        approvedAmount: response.data.byStatus.find(s => s._id === 'approved')?.amount || 0
      }));
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, [currentPage, methodFilter, dateRange, searchTerm]);

  // Edit deposit
  const editDeposit = async (depositId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/admin/deposits/${depositId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchDeposits(); // Refresh the list
      setShowEditModal(false);
    } catch (err) {
      console.error('Error editing deposit:', err);
      setError('Failed to edit deposit.');
    }
  };

  // Delete deposit
  const deleteDeposit = async (depositId) => {
    if (!window.confirm('Are you sure you want to delete this deposit? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/admin/deposits/${depositId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchDeposits(); // Refresh the list
      fetchStats(); // Refresh stats
      setShowDepositDetails(false);
    } catch (err) {
      console.error('Error deleting deposit:', err);
      setError('Failed to delete deposit.');
    }
  };

  // Sort deposits
  const sortedDeposits = React.useMemo(() => {
    let sortableItems = [...deposits];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'processedAt') {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
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
  }, [deposits, sortConfig]);

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

  // View deposit details
  const viewDepositDetails = (deposit) => {
    setSelectedDeposit(deposit);
    setShowDepositDetails(true);
  };

  // Close deposit details modal
  const closeDepositDetails = () => {
    setShowDepositDetails(false);
    setSelectedDeposit(null);
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
    }).format(amount);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    return {
      icon: <FaCheckCircle className="text-green-500" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    };
  };

  // Get method display name
  const getMethodName = (method) => {
    switch (method) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      case 'upay': return 'Upay';
      case 'bank': return 'Bank Transfer';
      case 'card': return 'Card Payment';
      default: return method;
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, methodFilter, dateRange]);

  // Export to CSV function
  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');

      let url = `${API_BASE_URL}/api/admin/deposits/export?status=approved`;

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (methodFilter !== 'all') params.append('method', methodFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      if (params.toString()) {
        url += `&${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `approved_deposit_history_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV. Please try again.');
    }
  };

  if (loading && deposits.length === 0) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
             <div className="flex justify-center items-center py-8">
                                                       <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                                                     </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="font-nunito h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'}`}>
          <div className="w-full mx-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button className="absolute top-0 right-0 p-3" onClick={() => setError(null)}>
                  <span className="text-red-700">×</span>
                </button>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Approved Deposits</h1>
                <p className="text-sm text-gray-600 mt-1">View and manage approved deposit transactions</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Approved Deposits</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Approved Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.approvedAmount)}</p>
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
                    placeholder="Search username, ID or transaction..."
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
                    <option value="userId.username">Username</option>
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
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="self-center text-gray-500 hidden md:inline">to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <p className="text-gray-600">
                Showing {deposits.length} of {stats.total} approved deposits
              </p>
              <p className="text-green-600 font-medium">
                Approved Amount: {formatCurrency(stats.approvedAmount)}
              </p>
            </div>

            {/* Deposits Table */}
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
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Transaction ID
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
                    {deposits.length > 0 ? (
                      deposits.map((deposit) => {
                        const statusInfo = getStatusInfo(deposit.status);
                        return (
                          <tr key={deposit._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{formatDate(deposit.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-700 font-mono">{deposit.userId?.player_id || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{deposit.userId?.username || 'Unknown'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{getMethodName(deposit.method)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{formatCurrency(deposit.amount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{deposit.phoneNumber || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">{deposit.transactionId || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full border ${statusInfo.color}`}>
                                {statusInfo.icon}
                                <span className="ml-1 capitalize">Completed</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                className="p-2 px-[8px] py-[7px] bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700"
                                title="View details"
                                onClick={() => viewDepositDetails(deposit)}
                              >
                                <FaEye />
                              </button>
                              <button
                                className="p-2 px-[8px] py-[7px] bg-green-600 text-white rounded-[3px] text-[16px] hover:bg-green-700"
                                title="Edit deposit"
                                onClick={() => {
                                  setSelectedDeposit(deposit);
                                  setShowEditModal(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="p-2 px-[8px] py-[7px] bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700"
                                title="Delete deposit"
                                onClick={() => deleteDeposit(deposit._id)}
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaSearch className="text-5xl mb-3 opacity-30" />
                            <p className="text-lg font-medium text-gray-500">No approved deposits found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {stats.total > itemsPerPage && (
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

                      {Array.from({ length: Math.ceil(stats.total / itemsPerPage) }, (_, i) => i + 1).map(page => (
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

      {/* Deposit Details Modal */}
      {showDepositDetails && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Approved Deposit Details</h3>
              <button onClick={closeDepositDetails} className="text-gray-400 hover:text-gray-500">
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
                      <dd className="text-sm font-medium text-gray-900">{selectedDeposit.transactionId || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Date & Time:</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedDeposit.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Payment Method:</dt>
                      <dd className="text-sm text-gray-900">{getMethodName(selectedDeposit.method)}</dd>
                    </div>
                    {selectedDeposit.processedAt && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Processed At:</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedDeposit.processedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Player ID:</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedDeposit.userId?.player_id || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Username:</dt>
                      <dd className="text-sm text-gray-900">{selectedDeposit.userId?.username || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Phone Number:</dt>
                      <dd className="text-sm text-gray-900">{selectedDeposit.phoneNumber || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Amount Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedDeposit.amount)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                <div className="px-4 py-2 inline-flex items-center rounded-md border bg-green-100 text-green-800 border-green-200">
                  <FaCheckCircle className="text-green-500" />
                  <span className="ml-2 capitalize font-medium">Approved</span>
                </div>
              </div>

              {selectedDeposit.adminNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedDeposit.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeDepositDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deposit Modal */}
      {showEditModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edit Approved Deposit</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updates = {
                    amount: parseFloat(formData.get('amount')),
                    method: formData.get('method'),
                    phoneNumber: formData.get('phoneNumber'),
                    transactionId: formData.get('transactionId'),
                    adminNotes: formData.get('adminNotes')
                  };
                  editDeposit(selectedDeposit._id, updates);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BDT)</label>
                    <input
                      type="number"
                      name="amount"
                      defaultValue={selectedDeposit.amount}
                      min="300"
                      max="50000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select
                      name="method"
                      defaultValue={selectedDeposit.method}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      {methods.filter(method => method !== 'all').map((method, index) => (
                        <option key={index} value={method}>{getMethodName(method)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      defaultValue={selectedDeposit.phoneNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      name="transactionId"
                      defaultValue={selectedDeposit.transactionId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <textarea
                      name="adminNotes"
                      defaultValue={selectedDeposit.adminNotes}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Approveddeposit;