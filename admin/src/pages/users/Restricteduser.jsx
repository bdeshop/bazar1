import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaPlus, FaSort, FaSortUp, FaSortDown, FaUser, FaPhone, FaEnvelope, FaIdCard } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { NavLink, useNavigate } from 'react-router-dom';

const Restricteduser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusToastMessage, setStatusToastMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const itemsPerPage = 10;
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const [users, setUsers] = useState([]);

  // Fetch restricted (suspended) users from API
  useEffect(() => {
    const fetchRestrictedUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/admin/users?status=suspended`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch restricted users');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching restricted users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestrictedUsers();
  }, [base_url]);

  const kycStatuses = ['all', 'verified', 'unverified', 'pending', 'rejected'];
  const roles = ['all', 'user', 'agent', 'admin', 'super_admin', 'vip'];

  // Sort users
  const sortedUsers = React.useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastPasswordChange') {
          aValue = new Date(aValue.$date || aValue);
          bValue = new Date(bValue.$date || bValue);
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
  }, [users, sortConfig]);

  // Filter users based on search and KYC status
  const filteredUsers = sortedUsers.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.player_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter;
    
    return matchesSearch && matchesKyc;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice(
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

  // Handle user deletion
  const handleDelete = (id) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${base_url}/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      setUsers(users.filter(user => user._id.$oid !== userToDelete));
      setStatusToastMessage('User deleted successfully');
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error deleting user');
      setShowStatusToast(true);
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setTimeout(() => {
        setShowStatusToast(false);
      }, 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Handle user status toggle
  const toggleStatus = async (id) => {
    try {
      const user = users.find(u => u._id.$oid === id);
      let newStatus;
      if (user.status === 'suspended') {
        newStatus = 'active';
      } else if (user.status === 'active') {
        newStatus = 'inactive';
      } else {
        newStatus = 'suspended';
      }
      
      const response = await fetch(`${base_url}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      setUsers(users.map(u => (u._id.$oid === id ? { ...u, status: newStatus } : u)));
      setStatusToastMessage(`${user.username} status changed to ${newStatus}`);
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error updating user status');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => {
        setShowStatusToast(false);
      }, 3000);
    }
  };

  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Close user details modal
  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  // Format date
  const formatDate = (dateObj) => {
    if (!dateObj || (!dateObj.$date && !dateObj)) return 'N/A';
    return new Date(dateObj.$date || dateObj).toLocaleDateString();
  };

  // Navigate to edit user page
  const editUser = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, kycFilter]);

  if (loading) {
    return (
      <section className="font-nunito h-screen">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full">
              <div className="relative flex justify-center items-center flex-col">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-semibold">Loading...</p>
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
    <section className="font-nunito h-screen">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%] ' : 'ml-0'}`}>
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Restricted User Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage all restricted platform users</p>
              </div>
              <NavLink 
                to="/admin/users/new" 
                className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[5px] hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <FaPlus className="mr-2" />
                Add New User
              </NavLink>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">Total Restricted Users</h3>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">KYC Verified</h3>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.kycStatus === 'verified').length}</p>
              </div>
              <div className="bg-white p-4 rounded-[5px] shadow-sm border-[1px] border-gray-200">
                <h3 className="text-sm font-medium text-gray-600">VIP Restricted Users</h3>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'vip').length}</p>
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
                    setKycFilter('all');
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
                    placeholder="Search username, email or ID..."
                  />
                </div>
                
                {/* KYC Filter */}
                <div>
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All KYC Status</option>
                    {kycStatuses.filter(status => status !== 'all').map((status, index) => (
                      <option key={index} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
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
                    <option value="username">Username</option>
                    <option value="createdAt">Registration Date</option>
                    <option value="balance">Balance</option>
                    <option value="total_bet">Total Bet</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <p className="text-gray-600">
                Showing {filteredUsers.length} of {users.length} restricted users
              </p>
            </div>
            
            {/* Users Table */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Player ID
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Balance
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        KYC Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((user) => (
                        <tr key={user._id.$oid} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img className="h-12 w-12 rounded-full object-cover shadow-sm border border-gray-200" src={user.avatar} alt={user.username} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">{user.player_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{user.email}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FaPhone className="mr-1" /> {user.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.balance} {user.currency}</div>
                            <div className="text-xs text-gray-500">Bonus: {user.bonusBalance}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.kycStatus === 'verified' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : user.kycStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {user.kycStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors duration-200 ${
                                user.status === 'active' 
                                  ? 'bg-green-500 text-white hover:bg-green-600 border border-green-500' 
                                  : user.status === 'inactive'
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600 border border-yellow-500'
                                  : 'bg-red-500 text-white hover:bg-red-600 border border-red-500'
                              }`}
                              onClick={() => toggleStatus(user._id.$oid)}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="p-2 px-[8px] py-[7px] bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700"
                                title="View details"
                                onClick={() => viewUserDetails(user)}
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="p-2 px-[8px] py-[7px] bg-orange-600 text-white rounded-[3px] text-[16px] hover:bg-orange-700"
                                title="Edit user"
                                onClick={() => editUser(user._id.$oid)}
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="p-2 px-[8px] py-[7px] bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700"
                                onClick={() => handleDelete(user._id.$oid)}
                                title="Delete user"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FaSearch className="text-5xl mb-3 opacity-30" />
                            <p className="text-lg font-medium text-gray-500">No restricted users found</p>
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
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                      </span> of{' '}
                      <span className="font-medium">{filteredUsers.length}</span> results
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
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

      {/* Status Change Toast */}
      {showStatusToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fadeIn">
          {statusToastMessage}
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button onClick={closeUserDetails} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  <img className="h-24 w-24 rounded-full object-cover shadow-md border border-gray-200" src={selectedUser.avatar} alt={selectedUser.username} />
                </div>
                
                <div className="flex-grow">
                  <h2 className="text-xl font-bold text-gray-800">{selectedUser.username}</h2>
                  <p className="text-sm text-gray-600 mb-4">Player ID: {selectedUser.player_id}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span className="text-sm">{selectedUser.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" />
                      <span className="text-sm capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="flex items-center">
                      <FaIdCard className="text-gray-400 mr-2" />
                      <span className="text-sm capitalize">{selectedUser.kycStatus}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Account Status</h4>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedUser.status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status}
                  </span>
                  
                  <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Balance</h4>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.balance} {selectedUser.currency}</p>
                  <p className="text-sm text-gray-600">Bonus: {selectedUser.bonusBalance}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Financial Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Deposit:</span>
                      <span className="text-sm font-medium">{selectedUser.total_deposit} {selectedUser.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Withdraw:</span>
                      <span className="text-sm font-medium">{selectedUser.total_withdraw} {selectedUser.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Bet:</span>
                      <span className="text-sm font-medium">{selectedUser.total_bet} {selectedUser.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Profit:</span>
                      <span className={`text-sm font-medium ${selectedUser.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.net_profit} {selectedUser.currency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Account Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registered:</span>
                      <span className="text-sm font-medium">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Login:</span>
                      <span className="text-sm font-medium">{selectedUser.login_count} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Language:</span>
                      <span className="text-sm font-medium uppercase">{selectedUser.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Referral Code:</span>
                      <span className="text-sm font-medium">{selectedUser.referralCode}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Verification Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-3 rounded-md text-center ${selectedUser.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs">{selectedUser.isEmailVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                  <div className={`p-3 rounded-md text-center ${selectedUser.isPhoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-xs">{selectedUser.isPhoneVerified ? 'Verified' : 'Not Verified'}</p>
                  </div>
                  <div className={`p-3 rounded-md text-center ${
                    selectedUser.kycStatus === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedUser.kycStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">KYC</p>
                    <p className="text-xs capitalize">{selectedUser.kycStatus}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeUserDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none"
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

export default Restricteduser;