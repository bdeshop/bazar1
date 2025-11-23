import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaEye, FaDownload } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { toast, Toaster } from 'react-hot-toast';
import axios from "axios"
import { FaSpinner } from 'react-icons/fa';

const Allbets = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token')
  const itemsPerPage = 10;
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Bet data state - initially empty, will be populated from API
  const [bets, setBets] = useState([]);
  
  // Fetch betting history from API
  const fetchBettingHistory = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/betting-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response);
      if (response.data.success) {
        // Transform API data to match component format
        const transformedBets = response.data.data.map((bet, index) => ({
          id: bet._id?.$oid || `bet-${index}`,
          betId: bet.serial_number || `BT${String(index + 1).padStart(6, '0')}`,
          username: bet.original_username || bet.member_account,
          game: bet.game_uid || 'Unknown Game',
          betAmount: bet.bet_amount || 0,
          winAmount: bet.win_amount || 0,
          status: bet.status ? bet.status.charAt(0).toUpperCase() + bet.status.slice(1) : 'Unknown',
          date: bet.transaction_time?.$date || bet.createdAt?.$date || new Date().toISOString(),
          odds: 1.0, // You might need to add this field to your API
          type: bet.game_type ? bet.game_type.charAt(0).toUpperCase() + bet.game_type.slice(1) : 'Single',
          platform: bet.platform || bet.device_info || 'Web',
          // Additional fields from API that might be useful
          netAmount: bet.net_amount || 0,
          currency: bet.currency_code || 'BDT',
          balanceBefore: bet.balance_before || 0,
          balanceAfter: bet.balance_after || 0
        }));
        
        setBets(transformedBets);
      } else {
        setError('Failed to fetch betting history');
        toast.error('Failed to fetch betting history');
      }
    } catch (err) {
      console.error('Error fetching betting history:', err);
      setError('Error loading betting history');
      toast.error('Error loading betting history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBettingHistory();
  }, []);

  const games = ['all', ...Array.from(new Set(bets.map(bet => bet.game).filter(Boolean)))];
  const statuses = ['all', ...Array.from(new Set(bets.map(bet => bet.status).filter(Boolean)))];
  const dateRanges = ['all', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Custom'];

  // Sort bets
  const sortedBets = React.useMemo(() => {
    let sortableItems = [...bets];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [bets, sortConfig]);

  // Filter bets based on search and filters
  const filteredBets = sortedBets.filter(bet => {
    const matchesSearch = bet.betId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bet.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === 'all' || bet.game === gameFilter;
    const matchesStatus = statusFilter === 'all' || bet.status === statusFilter;
    
    return matchesSearch && matchesGame && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const currentItems = filteredBets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // Handle view details
  const viewDetails = (bet) => {
    setSelectedBet(bet);
    setShowDetailsModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gameFilter, statusFilter, dateFilter]);

  // Calculate totals
  const totalBetAmount = filteredBets.reduce((sum, bet) => sum + bet.betAmount, 0);
  const totalWinAmount = filteredBets.reduce((sum, bet) => sum + bet.winAmount, 0);
  const totalProfit = totalWinAmount - totalBetAmount;

  // Refresh data
  const handleRefresh = () => {
    fetchBettingHistory();
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                           <div className="flex justify-center items-center py-8">
                                                                           <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                                                                         </div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (error && bets.length === 0) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'}`}>
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button 
                  onClick={fetchBettingHistory}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Retry
                </button>
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
      <Toaster position="top-right" />

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
                <h1 className="text-2xl font-bold text-gray-800">Bet History</h1>
                <p className="text-sm text-gray-600 mt-1">View and manage all betting activities</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-all"
                >
                  Refresh
                </button>
                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[5px] hover:from-orange-600 hover:to-orange-700 transition-all">
                  <FaDownload className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Bets</h3>
                <p className="text-2xl font-bold text-gray-800">{filteredBets.length}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Bet Amount</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalBetAmount)}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Payout</h3>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalWinAmount)}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Profit/Loss</h3>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalProfit)}
                </p>
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
                    setGameFilter('all');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="text-sm text-orange-500 hover:text-orange-600 flex items-center"
                >
                  Clear All Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    placeholder="Search by Bet ID or Username..."
                  />
                </div>
                
                {/* Game Filter */}
                <div>
                  <select
                    value={gameFilter}
                    onChange={(e) => setGameFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Games</option>
                    {games.filter(game => game !== 'all').map((game, index) => (
                      <option key={index} value={game}>{game}</option>
                    ))}
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {statuses.filter(status => status !== 'all').map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                {/* Date Filter */}
                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {dateRanges.map((range, index) => (
                      <option key={index} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Count and Sort */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <p className="text-gray-600">
                Showing {filteredBets.length} of {bets.length} bets
              </p>
              
              <div className="flex items-center text-sm">
                <span className="mr-2 text-gray-600">Sort by:</span>
                <select 
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={sortConfig.key || ''}
                  onChange={(e) => requestSort(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="date">Date</option>
                  <option value="betAmount">Bet Amount</option>
                  <option value="winAmount">Win Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            
            {/* Bets Table */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Bet ID
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Username
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                        onClick={() => requestSort('game')}
                      >
                        <div className="flex items-center">
                          Game
                          {getSortIcon('game')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                        onClick={() => requestSort('betAmount')}
                      >
                        <div className="flex items-center">
                          Bet Amount
                          {getSortIcon('betAmount')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                        onClick={() => requestSort('winAmount')}
                      >
                        <div className="flex items-center">
                          Win Amount
                          {getSortIcon('winAmount')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                        onClick={() => requestSort('date')}
                      >
                        <div className="flex items-center">
                          Date & Time
                          {getSortIcon('date')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((bet) => (
                        <tr key={bet.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono font-semibold text-gray-900">{bet.betId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-700">{bet.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{bet.game}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-700">{formatCurrency(bet.betAmount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${bet.winAmount > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                              {formatCurrency(bet.winAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              bet.status === 'Won' 
                                ? 'bg-green-100 text-green-800' 
                                : bet.status === 'Lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {bet.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(bet.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="p-2 px-[8px] py-[7px] bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700 transition-colors"
                              onClick={() => viewDetails(bet)}
                              title="View details"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaSearch className="text-5xl mb-3 opacity-30" />
                            <p className="text-lg font-medium text-gray-500">No bets found</p>
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
            {filteredBets.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredBets.length)}
                      </span> of{' '}
                      <span className="font-medium">{filteredBets.length}</span> results
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

      {/* Bet Details Modal */}
      {showDetailsModal && selectedBet && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bet Details</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Bet ID</p>
                  <p className="text-sm text-gray-900">{selectedBet.betId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-sm text-gray-900">{selectedBet.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Game</p>
                  <p className="text-sm text-gray-900">{selectedBet.game}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bet Type</p>
                  <p className="text-sm text-gray-900">{selectedBet.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bet Amount</p>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedBet.betAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Win Amount</p>
                  <p className={`text-sm ${selectedBet.winAmount > 0 ? 'text-green-600 font-medium' : 'text-gray-900'}`}>
                    {formatCurrency(selectedBet.winAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Amount</p>
                  <p className={`text-sm ${selectedBet.netAmount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                    {formatCurrency(selectedBet.netAmount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${
                    selectedBet.status === 'Won' ? 'text-green-600' : 
                    selectedBet.status === 'Lost' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {selectedBet.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Platform</p>
                  <p className="text-sm text-gray-900">{selectedBet.platform}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Currency</p>
                  <p className="text-sm text-gray-900">{selectedBet.currency || 'BDT'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedBet.date)}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none"
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

export default Allbets;