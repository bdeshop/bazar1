import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaEye, FaDownload } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

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
  
  const itemsPerPage = 10;
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Sample bet log data
  const [bets, setBets] = useState([
    {
      id: 1,
      betId: 'BT0012354',
      username: 'john_doe',
      game: 'Lucky Spin',
      betAmount: 25.50,
      winAmount: 0,
      status: 'Lost',
      date: '2023-10-15 14:30:25',
      odds: 2.5,
      type: 'Single',
      platform: 'Mobile'
    },
    {
      id: 2,
      betId: 'BT0012355',
      username: 'sarah_smith',
      game: 'Blackjack Pro',
      betAmount: 100.00,
      winAmount: 200.00,
      status: 'Won',
      date: '2023-10-15 15:12:43',
      odds: 2.0,
      type: 'Single',
      platform: 'Desktop'
    },
    {
      id: 3,
      betId: 'BT0012356',
      username: 'mike_jones',
      game: 'Mega Fortune',
      betAmount: 50.00,
      winAmount: 250.00,
      status: 'Won',
      date: '2023-10-15 16:05:17',
      odds: 5.0,
      type: 'Single',
      platform: 'Mobile'
    },
    {
      id: 4,
      betId: 'BT0012357',
      username: 'emma_wilson',
      game: 'Live Roulette',
      betAmount: 75.00,
      winAmount: 0,
      status: 'Lost',
      date: '2023-10-15 17:22:09',
      odds: 3.2,
      type: 'Combo',
      platform: 'Desktop'
    },
    {
      id: 5,
      betId: 'BT0012358',
      username: 'alex_chen',
      game: 'Football Star',
      betAmount: 30.00,
      winAmount: 90.00,
      status: 'Won',
      date: '2023-10-15 18:40:35',
      odds: 3.0,
      type: 'Single',
      platform: 'Mobile'
    },
    {
      id: 6,
      betId: 'BT0012359',
      username: 'lisa_taylor',
      game: 'Diamond Dreams',
      betAmount: 45.00,
      winAmount: 0,
      status: 'Lost',
      date: '2023-10-15 19:15:22',
      odds: 4.5,
      type: 'Single',
      platform: 'Tablet'
    },
    {
      id: 7,
      betId: 'BT0012360',
      username: 'david_brown',
      game: 'Poker Masters',
      betAmount: 200.00,
      winAmount: 500.00,
      status: 'Won',
      date: '2023-10-15 20:05:47',
      odds: 2.5,
      type: 'Combo',
      platform: 'Desktop'
    },
    {
      id: 8,
      betId: 'BT0012361',
      username: 'susan_lee',
      game: 'Lucky Spin',
      betAmount: 15.00,
      winAmount: 37.50,
      status: 'Won',
      date: '2023-10-15 21:30:12',
      odds: 2.5,
      type: 'Single',
      platform: 'Mobile'
    },
    {
      id: 9,
      betId: 'BT0012362',
      username: 'robert_clark',
      game: 'Blackjack Pro',
      betAmount: 80.00,
      winAmount: 0,
      status: 'Lost',
      date: '2023-10-15 22:15:33',
      odds: 2.0,
      type: 'Single',
      platform: 'Desktop'
    },
    {
      id: 10,
      betId: 'BT0012363',
      username: 'jennifer_white',
      game: 'Mega Fortune',
      betAmount: 60.00,
      winAmount: 300.00,
      status: 'Won',
      date: '2023-10-15 23:05:19',
      odds: 5.0,
      type: 'Single',
      platform: 'Tablet'
    },
  ]);
  
  const games = ['all', 'Lucky Spin', 'Blackjack Pro', 'Mega Fortune', 'Live Roulette', 'Football Star', 'Diamond Dreams', 'Poker Masters'];
  const statuses = ['all', 'Won', 'Lost', 'Pending'];
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

  return (
    <section className="font-nunito h-screen">
      <Header toggleSidebar={toggleSidebar} />

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
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[5px] hover:from-orange-600 hover:to-orange-700 transition-all">
                <FaDownload className="mr-2" />
                Export Data
              </button>
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
                  <p className="text-sm font-medium text-gray-500">Odds</p>
                  <p className="text-sm text-gray-900">{selectedBet.odds}</p>
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