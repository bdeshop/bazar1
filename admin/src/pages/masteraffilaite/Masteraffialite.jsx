import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaPlus, FaSort, FaSortUp, FaSortDown, FaUser, FaPhone, FaEnvelope, FaMoneyBill, FaIdCard, FaUsers, FaChartLine } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { FaSpinner } from 'react-icons/fa';

const MasterAffiliate = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [createdByFilter, setCreatedByFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [affiliateToDelete, setAffiliateToDelete] = useState(null);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusToastMessage, setStatusToastMessage] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showAffiliateDetails, setShowAffiliateDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAffiliates, setTotalAffiliates] = useState(0);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionForm, setCommissionForm] = useState({ 
    commissionRate: 0, 
    depositRate: 0, 
    overrideCommission: 5 
  });
  const [selectedAffiliateId, setSelectedAffiliateId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    website: '',
    promoMethod: '',
    commissionRate: 0,
    depositRate: 0,
    commissionType: '',
    cpaRate: 0,
    status: '',
    verificationStatus: '',
    paymentMethod: '',
    minimumPayout: 0,
    payoutSchedule: '',
    autoPayout: false,
    overrideCommission: 5,
    notes: '',
    tags: [],
  });

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch all master affiliates
  useEffect(() => {
    const fetchMasterAffiliates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/admin/master-affiliates`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch master affiliates');
        }

        const data = await response.json();
        setAffiliates(data.data || []);
        setTotalAffiliates(data.count || 0);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching master affiliates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterAffiliates();
  }, []);

  const statuses = ['all', 'pending', 'active', 'suspended', 'banned', 'inactive'];
  const verificationStatuses = ['all', 'unverified', 'pending', 'verified', 'rejected'];

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

  // Handle affiliate deletion
  const handleDelete = (id) => {
    setAffiliateToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${base_url}/api/admin/master-affiliates/${affiliateToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete master affiliate');
      }

      const result = await response.json();
      setAffiliates(affiliates.filter(affiliate => affiliate._id !== affiliateToDelete));
      setStatusToastMessage('Master affiliate deleted successfully');
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error deleting master affiliate');
      setShowStatusToast(true);
    } finally {
      setShowDeleteConfirm(false);
      setAffiliateToDelete(null);
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAffiliateToDelete(null);
  };

  // Handle affiliate status toggle
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const response = await fetch(`${base_url}/api/admin/master-affiliates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update master affiliate status');
      }

      const updatedData = await response.json();
      const updatedAffiliates = affiliates.map(affiliate => {
        if (affiliate._id === id) {
          return { ...affiliate, status: newStatus };
        }
        return affiliate;
      });

      setAffiliates(updatedAffiliates);
      setStatusToastMessage(`Master affiliate status changed to ${newStatus}`);
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error updating master affiliate status');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Handle commission form change
  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setCommissionForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle affiliate verification status toggle
  const toggleVerificationStatus = async (id, currentStatus) => {
    try {
      let newStatus;
      switch (currentStatus) {
        case 'verified': newStatus = 'rejected'; break;
        case 'rejected': newStatus = 'pending'; break;
        case 'pending': newStatus = 'unverified'; break;
        default: newStatus = 'verified';
      }

      const response = await fetch(`${base_url}/api/admin/master-affiliates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ verificationStatus: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }

      const updatedData = await response.json();
      const updatedAffiliates = affiliates.map(affiliate => {
        if (affiliate._id === id) {
          return { ...affiliate, verificationStatus: newStatus };
        }
        return affiliate;
      });

      setAffiliates(updatedAffiliates);
      setStatusToastMessage(`Verification status changed to ${newStatus}`);
      setShowStatusToast(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error updating verification status');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // View affiliate details
  const viewAffiliateDetails = async (affiliate) => {
    try {
      const response = await fetch(`${base_url}/api/admin/master-affiliates/${affiliate._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch master affiliate details');
      }

      const data = await response.json();
      setSelectedAffiliate(data.data);
      setShowAffiliateDetails(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error fetching master affiliate details');
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Close affiliate details modal
  const closeAffiliateDetails = () => {
    setShowAffiliateDetails(false);
    setSelectedAffiliate(null);
  };

  // Open edit modal
  const openEditModal = async (affiliate) => {
    try {
      const response = await fetch(`${base_url}/api/admin/master-affiliates/${affiliate._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch master affiliate details for edit');
      }

      const data = await response.json();
      const affiliateData = data.data;
      setEditForm({
        firstName: affiliateData.firstName || '',
        lastName: affiliateData.lastName || '',
        phone: affiliateData.phone || '',
        company: affiliateData.company || '',
        website: affiliateData.website || '',
        promoMethod: affiliateData.promoMethod || '',
        commissionRate: affiliateData.commissionRate * 100 || 0,
        depositRate: affiliateData.depositRate * 100 || 0,
        commissionType: affiliateData.commissionType || '',
        cpaRate: affiliateData.cpaRate || 0,
        status: affiliateData.status || '',
        verificationStatus: affiliateData.verificationStatus || '',
        paymentMethod: affiliateData.paymentMethod || '',
        minimumPayout: affiliateData.minimumPayout || 0,
        payoutSchedule: affiliateData.payoutSchedule || '',
        autoPayout: affiliateData.autoPayout || false,
        overrideCommission: affiliateData.masterEarnings?.overrideCommission || 5,
        notes: affiliateData.notes || '',
        tags: affiliateData.tags || [],
      });
      setSelectedAffiliateId(affiliate._id);
      setShowEditModal(true);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error fetching master affiliate details for edit');
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Submit edit form
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...editForm,
        commissionRate: editForm.commissionRate / 100,
        depositRate: editForm.depositRate / 100,
      };

      const response = await fetch(`${base_url}/api/admin/master-affiliates/${selectedAffiliateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update master affiliate');
      }

      const updatedData = await response.json();
      setAffiliates(affiliates.map(a => a._id === selectedAffiliateId ? updatedData.data : a));
      setStatusToastMessage('Master affiliate updated successfully');
      setShowStatusToast(true);
      setShowEditModal(false);
    } catch (err) {
      setError(err.message);
      setStatusToastMessage('Error updating master affiliate');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Update commission structure
  const updateCommissionStructure = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${base_url}/api/admin/master-affiliates/${selectedAffiliateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          commissionRate: commissionForm.commissionRate / 100,
          depositRate: commissionForm.depositRate / 100,
          overrideCommission: commissionForm.overrideCommission
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update commission structure');
      }

      const updatedData = await response.json();
      setAffiliates(affiliates.map(a => {
        if (a._id === selectedAffiliateId) {
          return {
            ...a,
            commissionRate: commissionForm.commissionRate / 100,
            depositRate: commissionForm.depositRate / 100,
            masterEarnings: {
              ...a.masterEarnings,
              overrideCommission: commissionForm.overrideCommission
            }
          };
        }
        return a;
      }));

      setStatusToastMessage('Commission structure updated successfully');
      setShowStatusToast(true);
      setShowCommissionModal(false);
    } catch (err) {
      setStatusToastMessage('Error updating commission structure');
      setShowStatusToast(true);
    } finally {
      setTimeout(() => setShowStatusToast(false), 3000);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Filter and sort affiliates
  const filteredAffiliates = React.useMemo(() => {
    let filtered = [...affiliates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(affiliate =>
        affiliate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.masterCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.customMasterCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(affiliate => affiliate.status === statusFilter);
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(affiliate => affiliate.verificationStatus === verificationFilter);
    }

    // Apply created by filter
    if (createdByFilter !== 'all') {
      filtered = filtered.filter(affiliate => affiliate.createdByRole === createdByFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a;
        let bValue = b;

        // Handle nested properties
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
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

    return filtered;
  }, [affiliates, searchTerm, statusFilter, verificationFilter, createdByFilter, sortConfig]);

  // Calculate statistics
  const stats = {
    totalMasterAffiliates: filteredAffiliates.length,
    activeMasterAffiliates: filteredAffiliates.filter(a => a.status === 'active').length,
    verifiedMasterAffiliates: filteredAffiliates.filter(a => a.verificationStatus === 'verified').length,
    totalSubAffiliates: filteredAffiliates.reduce((sum, a) => sum + (a.totalSubAffiliates || 0), 0),
    totalEarnings: filteredAffiliates.reduce((sum, a) => sum + (a.masterEarnings?.totalEarnings || 0), 0).toFixed(2),
    pendingEarnings: filteredAffiliates.reduce((sum, a) => sum + (a.masterEarnings?.pendingEarnings || 0), 0).toFixed(2)
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Master Affiliate Management</h1>
                <p className="text-sm text-gray-500 mt-1">Oversee and manage all master affiliates and their sub-affiliate networks</p>
              </div>
              <NavLink
                to="/master-affiliates/create"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                <FaPlus className="mr-2" />
                Add Master Affiliate
              </NavLink>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { title: 'Total Master Affiliates', value: stats.totalMasterAffiliates, icon: FaUser, color: 'blue' },
                { title: 'Active Master Affiliates', value: stats.activeMasterAffiliates, icon: FaUsers, color: 'green' },
                { title: 'Total Sub-Affiliates', value: stats.totalSubAffiliates, icon: FaUsers, color: 'purple' },
                { title: 'Total Network Earnings', value: stats.totalEarnings + ' BDT', icon: FaChartLine, color: 'orange' },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`text-2xl text-${stat.color}-500`} />
                  </div>
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
                    setVerificationFilter('all');
                    setCreatedByFilter('all');
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
                    placeholder="Search name, email, or master code..."
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                >
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Verification Status Filter */}
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                >
                  {verificationStatuses.map((status, index) => (
                    <option key={index} value={status}>
                      {status === 'all' ? 'All Verification' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Created By Filter */}
                <select
                  value={createdByFilter}
                  onChange={(e) => setCreatedByFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                >
                  <option value="all">All Creators</option>
                  <option value="admin">Admin Created</option>
                  <option value="super_affiliate">Super Affiliate Created</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-gray-600">
              <p>
                Showing {filteredAffiliates.length} of {totalAffiliates} master affiliates
              </p>
            </div>

            {/* Master Affiliates Table */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Master Affiliate
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('masterCode')}>
                        Master Code {getSortIcon('masterCode')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('masterEarnings.pendingEarnings')}>
                        Network Stats {getSortIcon('masterEarnings.pendingEarnings')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Verification Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort('createdAt')}>
                        Registered {getSortIcon('createdAt')}
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs md:text-sm font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAffiliates.length > 0 ? (
                      filteredAffiliates.map((affiliate) => (
                        <tr key={affiliate._id} className="hover:bg-gray-50 text-nowrap transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  <FaUser />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{`${affiliate.firstName} ${affiliate.lastName}`}</div>
                                <div className="text-xs text-gray-500">{affiliate.company || 'No Company'}</div>
                                <div className="text-xs text-gray-400">
                                  Created by: {affiliate.createdByRole === 'admin' ? 'Admin' : 'Super Affiliate'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 font-mono px-2 py-1 bg-gray-100 rounded">
                              {affiliate.masterCode}
                            </div>
                            {affiliate.customMasterCode && (
                              <div className="text-xs text-gray-500 mt-1">
                                Custom: {affiliate.customMasterCode}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{affiliate.email}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <FaPhone className="mr-1" />
                              {affiliate.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {affiliate.masterEarnings?.pendingEarnings?.toFixed(2) || 0} BDT
                            </div>
                            <div className="text-xs text-gray-500">
                              Sub-Affiliates: {affiliate.totalSubAffiliates || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Override: {affiliate.masterEarnings?.overrideCommission || 5}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                affiliate.verificationStatus === 'verified' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : affiliate.verificationStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`} 
                              onClick={() => toggleVerificationStatus(affiliate._id, affiliate.verificationStatus)}
                            >
                              {affiliate.verificationStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={affiliate.status === 'active'}
                                onChange={() => toggleStatus(affiliate._id, affiliate.status)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{formatDate(affiliate.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-blue-600 text-white rounded-[3px] text-[16px] hover:bg-blue-700 shadow-sm"
                                title="View details"
                                onClick={() => viewAffiliateDetails(affiliate)}
                              >
                                <FaEye />
                              </button>
                              <button
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-green-600 text-white rounded-[3px] text-[16px] hover:bg-green-700 shadow-sm"
                                title="Edit commission"
                                onClick={() => {
                                  setSelectedAffiliateId(affiliate._id);
                                  setCommissionForm({
                                    commissionRate: (affiliate.commissionRate * 100).toFixed(0) || 0,
                                    depositRate: (affiliate.depositRate * 100).toFixed(0) || 0,
                                    overrideCommission: affiliate.masterEarnings?.overrideCommission || 5
                                  });
                                  setShowCommissionModal(true);
                                }}
                              >
                                <FaChartLine />
                              </button>
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-orange-600 text-white rounded-[3px] text-[16px] hover:bg-orange-700 shadow-sm"
                                onClick={() => openEditModal(affiliate)}
                                title="Edit affiliate"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="p-2 px-[8px] py-[7px] cursor-pointer bg-red-600 text-white rounded-[3px] text-[16px] hover:bg-red-700 shadow-sm"
                                onClick={() => handleDelete(affiliate._id)}
                                title="Delete affiliate"
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
                            <p className="text-lg font-medium text-gray-500">No master affiliates found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this master affiliate? This action cannot be undone and will affect all sub-affiliates.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Structure Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Commission Structure</h3>
            <form onSubmit={updateCommissionStructure}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bet Commission (%)</label>
                  <input 
                    type="number" 
                    name="commissionRate"
                    value={commissionForm.commissionRate}
                    onChange={handleCommissionChange}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit Commission (%)</label>
                  <input 
                    type="number" 
                    name="depositRate"
                    value={commissionForm.depositRate}
                    onChange={handleCommissionChange}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Override Commission (%)</label>
                  <input 
                    type="number" 
                    name="overrideCommission"
                    value={commissionForm.overrideCommission}
                    onChange={handleCommissionChange}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage earned from sub-affiliate commissions
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 border border-gray-300 cursor-pointer rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white cursor-pointer rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none transition-colors duration-200"
                >
                  Update Commissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Master Affiliate</h3>
            <form onSubmit={submitEdit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 p-[10px] rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input 
                    type="text" 
                    name="company"
                    value={editForm.company}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input 
                    type="text" 
                    name="website"
                    value={editForm.website}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Promo Method</label>
                  <select
                    name="promoMethod"
                    value={editForm.promoMethod}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="">Select Method</option>
                    <option value="website">Website</option>
                    <option value="social_media">Social Media</option>
                    <option value="youtube">YouTube</option>
                    <option value="blog">Blog</option>
                    <option value="email_marketing">Email Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                  <input 
                    type="number" 
                    name="commissionRate"
                    value={editForm.commissionRate}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit Rate (%)</label>
                  <input 
                    type="number" 
                    name="depositRate"
                    value={editForm.depositRate}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Override Commission (%)</label>
                  <input 
                    type="number" 
                    name="overrideCommission"
                    value={editForm.overrideCommission}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CPA Rate (BDT)</label>
                  <input 
                    type="number" 
                    name="cpaRate"
                    value={editForm.cpaRate}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    {statuses.slice(1).map((status, index) => (
                      <option key={index} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <select
                    name="verificationStatus"
                    value={editForm.verificationStatus}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    {verificationStatuses.slice(1).map((status, index) => (
                      <option key={index} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="binance">Binance</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Payout (BDT)</label>
                  <input 
                    type="number" 
                    name="minimumPayout"
                    value={editForm.minimumPayout}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payout Schedule</label>
                  <select
                    name="payoutSchedule"
                    value={editForm.payoutSchedule}
                    onChange={handleEditChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="manual">Manual</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi_weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="autoPayout"
                    checked={editForm.autoPayout}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Auto Payout</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea 
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-[10px] shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none transition-colors duration-200"
                >
                  Save Changes
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

      {/* Master Affiliate Details Modal */}
      {showAffiliateDetails && selectedAffiliate && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Master Affiliate Details</h3>
              <button onClick={closeAffiliateDetails} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shadow-md">
                    <FaUser className="text-3xl" />
                  </div>
                </div>

                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-gray-900">{`${selectedAffiliate.firstName} ${selectedAffiliate.lastName}`}</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Master Code: {selectedAffiliate.masterCode}
                    {selectedAffiliate.customMasterCode && ` (Custom: ${selectedAffiliate.customMasterCode})`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      {selectedAffiliate.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <FaPhone className="text-gray-400 mr-2" />
                      {selectedAffiliate.phone || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <FaIdCard className="text-gray-400 mr-2" />
                      <span className="capitalize">{selectedAffiliate.verificationStatus}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <FaUsers className="text-gray-400 mr-2" />
                      Created by: {selectedAffiliate.createdByRole === 'admin' ? 'Admin' : 'Super Affiliate'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Account Status</h4>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedAffiliate.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedAffiliate.status === 'pending'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAffiliate.status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedAffiliate.status}
                  </span>

                  <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Network Earnings</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedAffiliate.masterEarnings?.pendingEarnings?.toFixed(2) || 0} BDT
                  </p>
                  <p className="text-sm text-gray-600">
                    Override: {selectedAffiliate.masterEarnings?.overrideCommission || 5}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Network Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sub-Affiliates:</span>
                      <span className="font-medium">{selectedAffiliate.totalSubAffiliates || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Sub-Affiliates:</span>
                      <span className="font-medium">{selectedAffiliate.activeSubAffiliates || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Network Earnings:</span>
                      <span className="font-medium">{selectedAffiliate.masterEarnings?.totalEarnings?.toFixed(2) || 0} BDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Earnings:</span>
                      <span className="font-medium">{selectedAffiliate.masterEarnings?.paidEarnings?.toFixed(2) || 0} BDT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Commission Structure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bet Commission:</span>
                      <span className="font-medium">{(selectedAffiliate.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Commission:</span>
                      <span className="font-medium">{(selectedAffiliate.depositRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Override Commission:</span>
                      <span className="font-medium">{selectedAffiliate.masterEarnings?.overrideCommission || 5}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission Type:</span>
                      <span className="font-medium capitalize">{selectedAffiliate.commissionType || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{selectedAffiliate.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Payout:</span>
                    <span className="font-medium">{selectedAffiliate.minimumPayout?.toFixed(2) || 0} BDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payout Schedule:</span>
                    <span className="font-medium capitalize">{selectedAffiliate.payoutSchedule || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto Payout:</span>
                    <span className="font-medium">{selectedAffiliate.autoPayout ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0">
              <button
                onClick={closeAffiliateDetails}
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

export default MasterAffiliate;