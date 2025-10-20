import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaPlus, FaSort, FaSortUp, FaSortDown, FaSpinner } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Activegames = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [games, setGames] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const itemsPerPage = 10;
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  // Fetch games, categories, and providers on component mount
  useEffect(() => {
    fetchGames();
    fetchCategories();
    fetchProviders();
  }, [currentPage, searchTerm, categoryFilter, providerFilter]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/api/admin/games`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: 'true', // Only fetch active games
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          provider: providerFilter !== 'all' ? providerFilter : undefined,
          search: searchTerm || undefined
        }
      });
      
      // Handle both response formats (with pagination plugin and without)
      if (response.data.games) {
        // Response from our custom pagination
        setGames(response.data.games);
        setTotalGames(response.data.total);
        setTotalPages(response.data.totalPages);
      } else if (response.data.docs) {
        // Response from mongoose-paginate-v2
        setGames(response.data.docs);
        setTotalGames(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        // Fallback if response format is different
        setGames(response.data);
        setTotalGames(response.data.length);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to fetch games');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/games/categories/list`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${base_url}/api/admin/games/providers/list`);
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch providers');
    }
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort games based on sortConfig
  const sortedGames = React.useMemo(() => {
    if (!sortConfig.key) return games;
    
    return [...games].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [games, sortConfig]);

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="text-orange-500" />;
    return <FaSortDown className="text-orange-500" />;
  };

  // Handle game deletion
  const handleDelete = (id) => {
    setGameToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${base_url}/api/admin/games/${gameToDelete}`);
      // Refresh the games list
      fetchGames();
      setShowDeleteConfirm(false);
      setGameToDelete(null);
      toast.success('Game deleted successfully');
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setGameToDelete(null);
  };

  // Handle game status toggle (deactivate game)
  const deactivateGame = async (id) => {
    try {
      await axios.put(`${base_url}/api/admin/games/${id}/status`, {
        status: false
      });
      
      // Refresh the games list
      fetchGames();
      toast.success('Game deactivated successfully');
    } catch (error) {
      console.error('Error deactivating game:', error);
      toast.error('Failed to deactivate game');
    }
  };

  // Apply filters and refresh data
  const applyFilters = () => {
    setCurrentPage(1);
    fetchGames();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setProviderFilter('all');
    setCurrentPage(1);
    // Don't call fetchGames here as useEffect will trigger it
  };

  // Get unique categories from games for stats
  const uniqueCategories = new Set(games.map(g => g.category)).size;

  return (
    <section className="font-nunito h-screen ">
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
                <h1 className="text-2xl font-bold text-gray-800">Active Game Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage all active casino games</p>
              </div>
              <NavLink to="/games-management/new-game" className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[5px] hover:from-orange-600 hover:to-orange-700 transition-all">
                <FaPlus className="mr-2" />
                Add New Game
              </NavLink>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Active Games</h3>
                <p className="text-2xl font-bold text-gray-800">{totalGames}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Categories</h3>
                <p className="text-2xl font-bold text-gray-800">{uniqueCategories}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Providers</h3>
                <p className="text-2xl font-bold text-gray-800">{new Set(games.map(g => g.provider)).size}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Recently Added</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {games.length > 0 ? new Date(games[0]?.createdAt).toLocaleDateString() : 'N/A'}
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
                  onClick={resetFilters}
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
                    placeholder="Search games or ID..."
                  />
                </div>
                
                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Provider Filter */}
                <div>
                  <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Providers</option>
                    {providers.map((provider, index) => (
                      <option key={index} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
                
                {/* Status is fixed to active for this page */}
                <div>
                  <select
                    value="Active"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    disabled
                  >
                    <option value="Active">Active</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            
            {/* Results Count and Sort */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <p className="text-gray-600">
                Showing {games.length} of {totalGames} active games
              </p>
              
              <div className="flex items-center text-sm">
                <span className="mr-2 text-gray-600">Sort by:</span>
                <select 
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={sortConfig.key || ''}
                  onChange={(e) => requestSort(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="name">Name</option>
                  <option value="provider">Provider</option>
                  <option value="category">Category</option>
                  <option value="createdAt">Date Added</option>
                </select>
              </div>
            </div>
            
            {/* Games Table */}
            {loading ? (
              <div className="bg-white rounded-lg p-12 border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading active games...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center">
                            Game
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                          ID
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                          onClick={() => requestSort('provider')}
                        >
                          <div className="flex items-center">
                            Provider
                            {getSortIcon('provider')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer transition-colors hover:bg-orange-700"
                          onClick={() => requestSort('category')}
                        >
                          <div className="flex items-center">
                            Category
                            {getSortIcon('category')}
                          </div>
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
                      {sortedGames.length > 0 ? (
                        sortedGames.map((game) => (
                          <tr key={game._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <img 
                                    className="h-12 w-12 rounded-md object-cover shadow-sm border border-gray-200" 
                                    src={`${base_url}${game.portraitImage}`} 
                                    alt={game.name} 
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">{game.name}</div>
                                  <div className="text-xs text-gray-500">{new Date(game.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">{game.gameId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-700">{game.provider}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                {game.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors duration-200 ${
                                  game.status 
                                    ? 'bg-green-500 text-white hover:bg-green-600 border border-green-500' 
                                    : 'bg-red-500 text-white hover:bg-red-600 border border-red-500'
                                }`}
                                onClick={() => deactivateGame(game._id)}
                              >
                                {game.status ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <NavLink
                                  to={`/games-management/view-game/${game._id}`}
                                  className="p-2 px-[8px] py-[7px] bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700"
                                  title="View details"
                                >
                                  <FaEye />
                                </NavLink>
                                <NavLink
                                  to={`/games-management/edit-game/${game._id}`}
                                  className="p-2 px-[8px] py-[7px] bg-orange-600 text-white rounded-[3px] text-[16px] hover:bg-orange-700"
                                  title="Edit game"
                                >
                                  <FaEdit />
                                </NavLink>
                                <button 
                                  className="p-2 px-[8px] py-[7px] bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700"
                                  onClick={() => handleDelete(game._id)}
                                  title="Delete game"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <FaSearch className="text-5xl mb-3 opacity-30" />
                              <p className="text-lg font-medium text-gray-500">No active games found</p>
                              <p className="text-sm">Try adding some games or check your filters</p>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalGames)}
                      </span> of{' '}
                      <span className="font-medium">{totalGames}</span> results
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
                              ? 'z-10 bg-orange-500 border-orange-500 text-white'
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this game? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Activegames;