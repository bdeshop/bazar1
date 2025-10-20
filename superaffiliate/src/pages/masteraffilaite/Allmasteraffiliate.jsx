import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaPercentage,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaEdit,
  FaMoneyBillWave,
  FaChartLine,
  FaIdCard,
  FaCalendarAlt,
  FaWallet,
  FaTrash,
  FaCheck,
  FaExclamationTriangle,
  FaSync
} from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AllMasterAffiliate = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedMasterAffiliate, setSelectedMasterAffiliate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [masterAffiliates, setMasterAffiliates] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const affiliate = JSON.parse(localStorage.getItem('affiliate'));

  // Commission update state
  const [commissionData, setCommissionData] = useState({
    commissionRate: '',
    commissionType: 'revenue_share',
    cpaRate: '',
    depositRate: ''
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    loadMasterAffiliatesData();
  }, []);

  const loadMasterAffiliatesData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('affiliatetoken');

      if (!affiliate?.id) {
        toast.error('Affiliate ID not found');
        return;
      }

      const response = await axios.get(
        `${base_url}/api/affiliate/all-master-affiliate/${affiliate.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const affiliatesData = response.data.data || [];

        const processedMasterAffiliates = affiliatesData.map((affiliate, index) => {
          // Handle date parsing safely
          let createdAt;
          try {
            if (affiliate.createdAt?.$date) {
              createdAt = new Date(affiliate.createdAt.$date);
            } else if (affiliate.createdAt) {
              createdAt = new Date(affiliate.createdAt);
            } else {
              createdAt = new Date();
            }
          } catch (error) {
            console.error('Error parsing date:', error);
            createdAt = new Date();
          }

          return {
            id: affiliate._id?.$oid || affiliate._id || `affiliate-${index}`,
            email: affiliate.email || 'No email',
            firstName: affiliate.firstName || '',
            lastName: affiliate.lastName || '',
            fullName: `${affiliate.firstName || ''} ${affiliate.lastName || ''}`.trim() || 'Unknown Affiliate',
            phone: affiliate.phone || 'No phone',
            company: affiliate.company || 'No company',
            country: affiliate.address?.country || 'Bangladesh',
            status: affiliate.status || 'pending',
            verificationStatus: affiliate.verificationStatus || 'unverified',
            commissionRate: affiliate.commissionRate || 0, // No multiplication by 100
            commissionType: affiliate.commissionType || 'revenue_share',
            cpaRate: affiliate.cpaRate || 0,
            depositRate: affiliate.depositRate || 0, // No multiplication by 100
            totalEarnings: affiliate.masterEarnings?.totalEarnings || 0,
            pendingEarnings: affiliate.masterEarnings?.pendingEarnings || 0,
            paidEarnings: affiliate.masterEarnings?.paidEarnings || 0,
            referralCount: affiliate.totalReferrals || 0,
            activeReferrals: affiliate.activeSubAffiliates || 0,
            createdAt: createdAt,
            paymentMethod: affiliate.paymentMethod || 'Not set',
            affiliateCode: affiliate.masterCode || 'N/A',
            website: affiliate.website || 'N/A',
            promoMethod: affiliate.promoMethod || 'N/A',
            address: affiliate.address || {},
            socialMediaProfiles: affiliate.socialMediaProfiles || {},
            paymentDetails: affiliate.paymentDetails || {},
            notes: affiliate.notes || '',
            tags: affiliate.tags || []
          };
        });

        setMasterAffiliates(processedMasterAffiliates);
      } else {
        toast.error(response.data.message || 'Failed to load master affiliates data');
      }
    } catch (error) {
      console.error('Error loading master affiliates data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/affiliate/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load master affiliates data');
      }
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
    try {
      return new Date(date).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: FaUserCheck,
        label: 'Active'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: FaUserClock,
        label: 'Pending'
      },
      inactive: {
        color: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: FaUserTimes,
        label: 'Inactive'
      },
      suspended: {
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: FaUserTimes,
        label: 'Suspended'
      },
      banned: {
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: FaUserTimes,
        label: 'Banned'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (status) => {
    const config = {
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      unverified: { color: 'bg-gray-100 text-gray-800', label: 'Unverified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const statusConfig = config[status] || config.unverified;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
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
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  };

  // Status Switch Component
  const StatusSwitch = ({ affiliate, onStatusChange }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusToggle = async (newStatus) => {
      if (isLoading) return;

      setIsLoading(true);
      setActionLoading(affiliate.id);
      try {
        const token = localStorage.getItem('affiliatetoken');

        const response = await axios.put(
          `${base_url}/api/affiliate/master-affiliate/${affiliate.id}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          await onStatusChange();
          toast.success(`Status updated to ${newStatus}`);
        } else {
          toast.error(response.data.message || 'Failed to update status');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error(error.response?.data?.message || 'Failed to update status');
      } finally {
        setIsLoading(false);
        setActionLoading(null);
      }
    };

    const getSwitchConfig = () => {
      const config = {
        active: {
          bg: 'bg-green-500',
          text: 'Active',
          nextStatus: 'inactive'
        },
        inactive: {
          bg: 'bg-gray-400',
          text: 'Inactive',
          nextStatus: 'active'
        },
        pending: {
          bg: 'bg-yellow-500',
          text: 'Pending',
          nextStatus: 'active'
        },
        suspended: {
          bg: 'bg-red-500',
          text: 'Suspended',
          nextStatus: 'active'
        }
      };
      return config[affiliate.status] || config.inactive;
    };

    const config = getSwitchConfig();

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStatusToggle(config.nextStatus)}
          disabled={isLoading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200
            ${config.bg} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${affiliate.status === 'active' ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[60px]">
          {isLoading ? 'Updating...' : config.text}
        </span>
      </div>
    );
  };

  const handleCommissionUpdate = async () => {
    if (!selectedMasterAffiliate) return;

    setActionLoading('commission');
    try {
      const token = localStorage.getItem('affiliatetoken');

      // Update commission structure
      const response = await axios.put(
        `${base_url}/api/affiliate/master-affiliate/${selectedMasterAffiliate.id}/commission`,
        {
          commissionRate: parseFloat(commissionData.commissionRate) || 0,
          commissionType: commissionData.commissionType,
          cpaRate: parseFloat(commissionData.cpaRate) || 0,
          depositRate: parseFloat(commissionData.depositRate) || 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await loadMasterAffiliatesData();
        setShowCommissionModal(false);
        toast.success('Commission structure updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update commission');
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error(error.response?.data?.message || 'Failed to update commission structure');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAffiliate = async () => {
    if (!selectedMasterAffiliate) return;

    setActionLoading('delete');
    try {
      const token = localStorage.getItem('affiliatetoken');

      const response = await axios.delete(
        `${base_url}/api/affiliate/master-affiliate/${selectedMasterAffiliate.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await loadMasterAffiliatesData();
        setShowDeleteModal(false);
        toast.success('Master affiliate deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete affiliate');
      }
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Cannot delete affiliate with existing data');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete affiliate');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const openEditCommission = (affiliate) => {
    setSelectedMasterAffiliate(affiliate);
    setCommissionData({
      commissionRate: affiliate.commissionRate.toString(),
      commissionType: affiliate.commissionType,
      cpaRate: affiliate.cpaRate.toString(),
      depositRate: affiliate.depositRate.toString()
    });
    setShowCommissionModal(true);
  };

  const openDeleteConfirmation = (affiliate) => {
    setSelectedMasterAffiliate(affiliate);
    setShowDeleteModal(true);
  };

  const filteredAndSortedMasterAffiliates = masterAffiliates
    .filter(affiliate => {
      const matchesSearch =
        affiliate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (affiliate.affiliateCode && affiliate.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const viewAffiliateDetails = (affiliate) => {
    setSelectedMasterAffiliate(affiliate);
    setShowDetailsModal(true);
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
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900">
                    Master Affiliates
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage and track your master affiliate accounts and commissions
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <FaUserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Master Affiliates</p>
                    <p className="text-2xl font-bold text-gray-900">{masterAffiliates.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <FaChartLine className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {masterAffiliates.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <FaUserClock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {masterAffiliates.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <FaMoneyBillWave className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(masterAffiliates.reduce((sum, a) => sum + (a.totalEarnings || 0), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, company, or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[160px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Showing {filteredAndSortedMasterAffiliates.length} of {masterAffiliates.length} affiliates
                </div>
              </div>
            </div>

            {/* Master Affiliates Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600">
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('fullName')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Affiliate</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Company</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Status</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('commissionRate')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Commission</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('totalEarnings')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Earnings</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('referralCount')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Referrals</span>
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider cursor-pointer border-b border-gray-200"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Joined</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredAndSortedMasterAffiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-sm">
                                {affiliate.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {affiliate.fullName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <FaEnvelope className="w-3 h-3 mr-2" />
                                {affiliate.email}
                              </div>
                              <div className="text-xs text-gray-400 font-mono mt-1">
                                #{affiliate.affiliateCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{affiliate.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusSwitch
                            affiliate={affiliate}
                            onStatusChange={loadMasterAffiliatesData}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-50 rounded-lg p-2">
                              <FaPercentage className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-gray-900">
                                {affiliate.commissionRate}%
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {affiliate.commissionType?.replace('_', ' ') || 'revenue share'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(affiliate.totalEarnings)}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Pending: {formatCurrency(affiliate.pendingEarnings)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {affiliate.referralCount}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              {affiliate.activeReferrals} active
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaCalendarAlt className="w-3 h-3 mr-2 text-gray-400" />
                            {formatDate(affiliate.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewAffiliateDetails(affiliate)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                              disabled={actionLoading === affiliate.id}
                            >
                              <FaEye className="w-4 h-4 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => openEditCommission(affiliate)}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                              disabled={actionLoading === affiliate.id}
                            >
                              <FaEdit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteConfirmation(affiliate)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                              disabled={actionLoading === affiliate.id}
                            >
                              <FaTrash className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAndSortedMasterAffiliates.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="p-8">
                      <h3 className="text-md font-medium text-gray-900 mb-2">No master affiliates found</h3>
                      <p className="text-gray-500 mb-4 text-sm">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'No master affiliate accounts have been created yet'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Master Affiliate Details Modal */}
      {showDetailsModal && selectedMasterAffiliate && (
        <div className="fixed inset-0 font-poppins bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full no-scrollbar max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-xl p-3">
                    <FaIdCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Master Affiliate Details</h3>
                    <p className="text-gray-600">Complete profile information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaIdCard className="w-5 h-5 mr-2 text-blue-500" />
                      Personal Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Full Name</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedMasterAffiliate.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Email</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                          {selectedMasterAffiliate.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Phone</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <FaPhone className="w-3 h-3 mr-2 text-gray-400" />
                          {selectedMasterAffiliate.phone}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500">Country</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <FaMapMarkerAlt className="w-3 h-3 mr-2 text-gray-400" />
                          {selectedMasterAffiliate.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaBuilding className="w-5 h-5 mr-2 text-green-500" />
                      Business Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Company</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedMasterAffiliate.company}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Website</span>
                        <span className="text-sm text-blue-600">{selectedMasterAffiliate.website}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Promo Method</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {selectedMasterAffiliate.promoMethod?.replace('_', ' ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500">Affiliate Code</span>
                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {selectedMasterAffiliate.affiliateCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission & Performance */}
                <div className="space-y-6">
                  {/* Commission Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaMoneyBillWave className="w-5 h-5 mr-2 text-yellow-500" />
                      Commission Structure
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Commission Rate</span>
                        <span className="text-lg font-bold text-blue-600">{selectedMasterAffiliate.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Commission Type</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedMasterAffiliate.commissionType?.replace('_', ' ') || 'revenue share'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">CPA Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedMasterAffiliate.cpaRate}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500">Deposit Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedMasterAffiliate.depositRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaChartLine className="w-5 h-5 mr-2 text-green-500" />
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-2xl font-bold text-blue-600">{selectedMasterAffiliate.referralCount}</p>
                        <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-2xl font-bold text-green-600">{selectedMasterAffiliate.activeReferrals}</p>
                        <p className="text-sm text-green-600 font-medium">Active Referrals</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(selectedMasterAffiliate.totalEarnings)}
                        </p>
                        <p className="text-sm text-yellow-600 font-medium">Total Earnings</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(selectedMasterAffiliate.pendingEarnings)}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">Pending Earnings</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUserCheck className="w-5 h-5 mr-2 text-purple-500" />
                      Account Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Status</span>
                        {getStatusBadge(selectedMasterAffiliate.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Verification</span>
                        {getVerificationBadge(selectedMasterAffiliate.verificationStatus)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Payment Method</span>
                        <span className="text-sm text-gray-900 flex items-center">
                          <FaWallet className="w-3 h-3 mr-2 text-gray-400" />
                          {selectedMasterAffiliate.paymentMethod || 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditCommission(selectedMasterAffiliate);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center"
                >
                  Edit Commission
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Update Modal */}
      {showCommissionModal && selectedMasterAffiliate && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white font-poppins rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Update Commission</h3>
                    <p className="text-gray-600">for {selectedMasterAffiliate.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={commissionData.commissionRate}
                    onChange={(e) => setCommissionData({ ...commissionData, commissionRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter commission rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Type
                  </label>
                  <select
                    value={commissionData.commissionType}
                    onChange={(e) => setCommissionData({ ...commissionData, commissionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="revenue_share">Revenue Share</option>
                    <option value="cpa">CPA</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPA Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={commissionData.cpaRate}
                    onChange={(e) => setCommissionData({ ...commissionData, cpaRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CPA rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={commissionData.depositRate}
                    onChange={(e) => setCommissionData({ ...commissionData, depositRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter deposit rate"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommissionUpdate}
                  disabled={actionLoading === 'commission'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-[5px] cursor-pointer hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center disabled:opacity-50"
                >
                  {actionLoading === 'commission' ? 'Updating...' : 'Update Commission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMasterAffiliate && (
        <div className="fixed inset-0 font-poppins bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 rounded-xl p-2">
                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Master Affiliate</h3>
                    <p className="text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  Are you sure you want to delete <strong>{selectedMasterAffiliate.fullName}</strong>?
                  This will permanently remove all their data from the system.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-[5px] hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAffiliate}
                  disabled={actionLoading === 'delete'}
                  className="px-6 py-2 bg-red-600 text-white rounded-[5px] hover:bg-red-700 transition-colors duration-200 font-medium flex items-center disabled:opacity-50"
                >
                  {actionLoading === 'delete' ? (
                    <FaSync className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FaTrash className="w-4 h-4 mr-2" />
                  )}
                  {actionLoading === 'delete' ? 'Deleting...' : 'Delete Affiliate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMasterAffiliate;