import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaRedo, FaMoneyBill, FaCalendar, FaUser, FaPhone, FaEnvelope, FaIdCard, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {useNavigate} from "react-router-dom"
import { FaSpinner } from 'react-icons/fa';

const Payout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusToastMessage, setStatusToastMessage] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutDetails, setShowPayoutDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState(null);
  const [processForm, setProcessForm] = useState({
    transactionId: '',
    processorNotes: '',
    estimatedCompletionDate: ''
  });
  const [completeForm, setCompleteForm] = useState({
    finalAmount: '',
    fees: {
      processingFee: 0,
      transactionFee: 0,
      tax: 0,
      otherDeductions: 0
    },
    processorNotes: ''
  });
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    failureReason: 'other'
  });

  const navigate = useNavigate();
  const itemsPerPage = 10;
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Status options
  const statuses = ['all', 'pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold'];
  const paymentMethods = ['all', 'bkash', 'nagad', 'rocket', 'binance', 'bank_transfer', 'crypto', 'other'];
  const failureReasons = [
    'insufficient_balance',
    'invalid_account',
    'network_error',
    'bank_rejection',
    'manual_review',
    'suspected_fraud',
    'other'
  ];

  // Fetch payouts from API
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter !== 'all' ? statusFilter : '',
          paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : '',
          startDate: startDate,
          endDate: endDate,
          search: searchTerm,
          sortBy: sortConfig.key || 'createdAt',
          sortOrder: sortConfig.direction
        });

        const response = await fetch(`${base_url}/api/admin/payouts?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payouts');
        }

        const data = await response.json();
        setPayouts(data.payouts || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.pages || 1);
        setTotalPayouts(data.pagination?.total || 0);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [currentPage, statusFilter, paymentMethodFilter, startDate, endDate, searchTerm, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="text-orange-500" />;
    return <FaSortDown className="text-orange-500" />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount, currency = 'BDT') => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      on_hold: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get payment method display name
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      binance: 'Binance',
      bank_transfer: 'Bank Transfer',
      crypto: 'Cryptocurrency',
      other: 'Other'
    };
    return methods[method] || method;
  };

  // Process payout
  const handleProcessPayout = (payoutId) => {
    setSelectedPayoutId(payoutId);
    setProcessForm({
      transactionId: '',
      processorNotes: '',
      estimatedCompletionDate: ''
    });
    setShowProcessModal(true);
  };

  const submitProcess = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_url}/api/admin/payouts/${selectedPayoutId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(processForm)
      });

      if (!response.ok) {
        throw new Error('Failed to process payout');
      }

      const data = await response.json();
      
      // Update local state
      setPayouts(payouts.map(payout => 
        payout._id === selectedPayoutId 
          ? { ...payout, status: 'processing', processedAt: new Date() }
          : payout
      ));

      setStatusToastMessage('Payout is now being processed');
      setShowStatusToast(true);
      setShowProcessModal(false);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error processing payout');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Complete payout
  const handleCompletePayout = (payout) => {
    setSelectedPayoutId(payout._id);
    setCompleteForm({
      finalAmount: payout.amount,
      fees: {
        processingFee: payout.fees?.processingFee || 0,
        transactionFee: payout.fees?.transactionFee || 0,
        tax: payout.fees?.tax || 0,
        otherDeductions: payout.fees?.otherDeductions || 0
      },
      processorNotes: ''
    });
    setShowCompleteModal(true);
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_url}/api/admin/payouts/${selectedPayoutId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(completeForm)
      });

      if (!response.ok) {
        throw new Error('Failed to complete payout');
      }

      const data = await response.json();
      
      // Update local state
      setPayouts(payouts.map(payout => 
        payout._id === selectedPayoutId 
          ? { 
              ...payout, 
              status: 'completed', 
              completedAt: new Date(),
              netAmount: data.payout?.netAmount || payout.netAmount
            }
          : payout
      ));

      setStatusToastMessage('Payout completed successfully');
      setShowStatusToast(true);
      setShowCompleteModal(false);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error completing payout');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Reject payout
  const handleRejectPayout = (payoutId) => {
    setSelectedPayoutId(payoutId);
    setRejectForm({
      reason: '',
      failureReason: 'other'
    });
    setShowRejectModal(true);
  };

  const submitReject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_url}/api/admin/payouts/${selectedPayoutId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(rejectForm)
      });

      if (!response.ok) {
        throw new Error('Failed to reject payout');
      }

      // Update local state
      setPayouts(payouts.map(payout => 
        payout._id === selectedPayoutId 
          ? { ...payout, status: 'failed' }
          : payout
      ));

      setStatusToastMessage('Payout rejected successfully');
      setShowStatusToast(true);
      setShowRejectModal(false);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error rejecting payout');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Retry payout
  const handleRetryPayout = async (payoutId) => {
    try {
      const response = await fetch(`${base_url}/api/admin/payouts/${payoutId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ notes: 'Retry initiated by admin' })
      });

      if (!response.ok) {
        throw new Error('Failed to retry payout');
      }

      const data = await response.json();
      
      // Update local state
      setPayouts(payouts.map(payout => 
        payout._id === payoutId 
          ? { ...payout, status: 'pending', retryAttempt: data.payout?.retryAttempt }
          : payout
      ));

      setStatusToastMessage('Payout retry initiated successfully');
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error retrying payout');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // View payout details
  const viewPayoutDetails = async (payout) => {
    setSelectedPayout(payout);
    setShowPayoutDetails(true);
  };

  // Close payout details
  const closePayoutDetails = () => {
    setShowPayoutDetails(false);
    setSelectedPayout(null);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentMethodFilter, startDate, endDate]);

  if (loading) {
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

  if (error) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-2xl mb-4">Error</div>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md"
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

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and process affiliate payouts efficiently</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { title: 'Total Payouts', value: totalPayouts, color: 'blue' },
                { title: 'Pending Payouts', value: payouts.filter(p => p.status === 'pending').length, color: 'yellow' },
                { title: 'Processing Payouts', value: payouts.filter(p => p.status === 'processing').length, color: 'blue' },
                { title: 'Total Amount', value: formatCurrency(payouts.reduce((sum, p) => sum + p.amount, 0)), color: 'green' },
              ].map((stat, index) => (
                <div key={index} className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200`}>
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaFilter className="mr-2 text-orange-500" />
                  Filters & Search
                </h2>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPaymentMethodFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-sm text-orange-500 hover:text-orange-700 flex items-center transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                    placeholder="Search payout ID, affiliate..."
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                >
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>

                {/* Payment Method Filter */}
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                >
                  {paymentMethods.map((method, index) => (
                    <option key={index} value={method}>{getPaymentMethodDisplay(method)}</option>
                  ))}
                </select>

                {/* Date Range */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-gray-600">
              <p>
                Showing {payouts.length} of {totalPayouts} payouts
              </p>
            </div>

            {/* Payouts Table */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Affiliate
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('amount')}>
                        Amount {getSortIcon('amount')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('createdAt')}>
                        Requested {getSortIcon('createdAt')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.length > 0 ? (
                      payouts.map((payout) => (
                        <tr key={payout._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-semibold text-gray-900">{payout.payoutId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  <FaUser />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payout.affiliate?.firstName} {payout.affiliate?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{payout.affiliate?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(payout.amount, payout.currency)}</div>
                            <div className="text-xs text-gray-500">Net: {formatCurrency(payout.netAmount, payout.currency)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{getPaymentMethodDisplay(payout.paymentMethod)}</div>
                            <div className="text-xs text-gray-500">
                              {payout.paymentDetails?.[payout.paymentMethod]?.phoneNumber || 
                               payout.paymentDetails?.[payout.paymentMethod]?.walletAddress || 
                               payout.paymentDetails?.[payout.paymentMethod]?.accountNumber || 
                               'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{formatDate(payout.requestedAt)}</div>
                            {payout.processedAt && (
                              <div className="text-xs text-gray-500">Processed: {formatDate(payout.processedAt)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700 shadow-sm"
                                title="View details"
                                onClick={() => viewPayoutDetails(payout)}
                              >
                                <FaEye />
                              </button>
                              
                              {payout.status === 'pending' && (
                                <>
                                  <button 
                                    className="p-2 px-[8px] py-[7px] cursor-pointer bg-green-600 text-white rounded-[3px] text-[16px] hover:bg-green-700 shadow-sm"
                                    title="Process payout"
                                    onClick={() => handleProcessPayout(payout._id)}
                                  >
                                    <FaCheck />
                                  </button>
                                  <button 
                                    className="p-2 px-[8px] py-[7px] cursor-pointer bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700 shadow-sm"
                                    title="Reject payout"
                                    onClick={() => handleRejectPayout(payout._id)}
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              
                              {payout.status === 'processing' && (
                                <button 
                                  className="p-2 px-[8px] py-[7px] cursor-pointer bg-green-600 text-white rounded-[3px] text-[16px] hover:bg-green-700 shadow-sm"
                                  title="Complete payout"
                                  onClick={() => handleCompletePayout(payout)}
                                >
                                  <FaCheck />
                                </button>
                              )}
                              
                              {payout.status === 'failed' && payout.retryAttempt < payout.maxRetries && (
                                <button 
                                  className="p-2 px-[8px] py-[7px] cursor-pointer bg-orange-600 text-white rounded-[3px] text-[16px] hover:bg-orange-700 shadow-sm"
                                  title="Retry payout"
                                  onClick={() => handleRetryPayout(payout._id)}
                                >
                                  <FaRedo />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaSearch className="text-5xl mb-3 opacity-30" />
                            <p className="text-lg font-medium text-gray-500">No payouts found</p>
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
            {payouts.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalPayouts)}
                      </span> of{' '}
                      <span className="font-medium">{totalPayouts}</span> results
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative cursor-pointer inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
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

      {/* Process Payout Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Payout</h3>
            <form onSubmit={submitProcess}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <input 
                    type="text" 
                    value={processForm.transactionId}
                    onChange={(e) => setProcessForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Completion Date</label>
                  <input 
                    type="date" 
                    value={processForm.estimatedCompletionDate}
                    onChange={(e) => setProcessForm(prev => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Processor Notes</label>
                  <textarea 
                    value={processForm.processorNotes}
                    onChange={(e) => setProcessForm(prev => ({ ...prev, processorNotes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    rows="3"
                    placeholder="Add any notes for processing..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 cursor-pointer rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white cursor-pointer rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none transition-colors duration-200"
                >
                  Process Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Payout Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payout</h3>
            <form onSubmit={submitComplete}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Final Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={completeForm.finalAmount}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, finalAmount: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Fee</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={completeForm.fees.processingFee}
                      onChange={(e) => setCompleteForm(prev => ({ 
                        ...prev, 
                        fees: { ...prev.fees, processingFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction Fee</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={completeForm.fees.transactionFee}
                      onChange={(e) => setCompleteForm(prev => ({ 
                        ...prev, 
                        fees: { ...prev.fees, transactionFee: parseFloat(e.target.value) || 0 }
                      }))}
                      className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Processor Notes</label>
                  <textarea 
                    value={completeForm.processorNotes}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, processorNotes: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    rows="3"
                    placeholder="Add completion notes..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-gray-300 cursor-pointer rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white cursor-pointer rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none transition-colors duration-200"
                >
                  Complete Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payout Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Payout</h3>
            <form onSubmit={submitReject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Failure Reason</label>
                  <select
                    value={rejectForm.failureReason}
                    onChange={(e) => setRejectForm(prev => ({ ...prev, failureReason: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    {failureReasons.map((reason, index) => (
                      <option key={index} value={reason}>
                        {reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason Details</label>
                  <textarea 
                    value={rejectForm.reason}
                    onChange={(e) => setRejectForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    rows="3"
                    placeholder="Provide detailed reason for rejection..."
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 cursor-pointer rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors duration-200"
                >
                  Reject Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Change Toast */}
      {showStatusToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {statusToastMessage}
        </div>
      )}

      {/* Payout Details Modal */}
      {showPayoutDetails && selectedPayout && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Payout Details - {selectedPayout.payoutId}</h3>
              <button onClick={closePayoutDetails} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Affiliate Information */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Affiliate Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {selectedPayout.affiliate?.firstName} {selectedPayout.affiliate?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedPayout.affiliate?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Affiliate Code:</span>
                      <span className="font-medium">{selectedPayout.affiliate?.affiliateCode}</span>
                    </div>
                  </div>
                </div>

                {/* Payout Summary */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Payout Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPayout.status)}`}>
                        {selectedPayout.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayout.amount, selectedPayout.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayout.netAmount, selectedPayout.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees:</span>
                      <span className="font-medium">{formatCurrency(selectedPayout.totalFees, selectedPayout.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{getPaymentMethodDisplay(selectedPayout.paymentMethod)}</span>
                  </div>
                  {selectedPayout.paymentDetails?.[selectedPayout.paymentMethod] && (
                    Object.entries(selectedPayout.paymentDetails[selectedPayout.paymentMethod]).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{value || 'N/A'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium">{formatDate(selectedPayout.requestedAt)}</span>
                  </div>
                  {selectedPayout.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed:</span>
                      <span className="font-medium">{formatDate(selectedPayout.processedAt)}</span>
                    </div>
                  )}
                  {selectedPayout.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{formatDate(selectedPayout.completedAt)}</span>
                    </div>
                  )}
                  {selectedPayout.estimatedCompletionDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Completion:</span>
                      <span className="font-medium">{formatDate(selectedPayout.estimatedCompletionDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0">
              <button
                onClick={closePayoutDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Payout;