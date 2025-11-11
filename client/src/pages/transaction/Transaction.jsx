import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiSliders, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaFolderOpen, FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import axios from "axios";
import { format } from "date-fns";
import logo from "../../assets/logo.png"
const Transaction = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await axios.get(`${base_url}/api/user/all-transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTransactions(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      startDate: "",
      endDate: ""
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': case 'cancelled': case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTransactionIcon = (type) => {
    if (type === 'deposit') return <RiMoneyDollarCircleLine className="text-green-400 text-xl" />;
    if (type === 'withdrawal') return <FaMoneyBillWave className="text-red-400 text-xl" />;
    return <FaExchangeAlt className="text-blue-400 text-xl" />;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-[#2c2c2c] rounded-md text-sm disabled:opacity-50"
        >
          Previous
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === pageNum 
                  ? 'bg-theme_color text-white' 
                  : 'bg-[#2c2c2c]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {totalPages > 5 && (
          <span className="px-2 text-gray-400">...</span>
        )}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-[#2c2c2c] rounded-md text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#1a1a1a] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Area */}
        <div className="w-full h-full overflow-y-auto">
          <div className="mx-auto w-full overflow-y-auto min-h-screen max-w-screen-xl md:px-4 py-4 px-3">
            {/* Top Section */}
            <div className="flex flex-row items-center justify-between pt-[30px] md:pt-[60px] mb-6 gap-4">
              <h2 className="text-[18px] md:text-[22px] font-[600]">Transaction records</h2>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-[#2c2c2c] rounded-[2px] cursor-pointer text-sm hover:bg-[#3a3a3a] transition flex items-center gap-2"
                >
                  <FiSliders className="text-lg" />
                  Filters
                  {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="bg-[#2c2c2c] p-4 rounded-[2px] mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-400">Type</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full bg-[#3a3a3a] border border-[#4a4a4a] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-400">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full bg-[#3a3a3a] border border-[#4a4a4a] rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-400">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full bg-[#3a3a3a] border border-[#4a4a4a] rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-400">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full bg-[#3a3a3a] border border-[#4a4a4a] rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4 flex justify-end space-x-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-[#3a3a3a] rounded-[2px] cursor-pointer text-sm hover:bg-[#4a4a4a] transition"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={fetchTransactions}
                    className="px-4 py-2 bg-theme_color rounded-[2px] cursor-pointer text-sm hover:bg-opacity-90 transition"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Transactions List */}
            {loading ? (
                    <div className='w-full p-[20px] flex justify-center items-center'>
                             <div className="relative w-24 h-24 flex justify-center items-center">
                               <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                               <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                               </div>
                             </div>
                           </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="px-4 py-2 bg-theme_color rounded-md text-sm hover:bg-opacity-90 transition"
                >
                  Try Again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FaFolderOpen className="text-5xl text-theme_color mb-4" />
                <p className="text-gray-400">No transactions found</p>
                {Object.values(filters).some(filter => filter !== "") && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-theme_color rounded-md text-sm hover:bg-opacity-90 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="bg-[#2c2c2c] overflow-hidden">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="border-b border-[#3a3a3a] last:border-b-0 p-4 hover:bg-[#3a3a3a] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium capitalize">
                                {transaction.type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-[#3a3a3a] rounded-full capitalize">
                                {transaction.method}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {formatDate(transaction.createdAt)}
                            </p>
                            {transaction.description && (
                              <p className="text-sm text-gray-400 mt-1">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)}
                          </div>
                          <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {renderPagination()}
              </>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Transaction;