import React, { useState, useEffect, useMemo } from 'react';
import { FaUser, FaMoneyBillWave, FaCreditCard, FaUsers, FaTimes, FaEye, FaSpinner, FaSearch, FaSort } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const AffiliateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [masterAffiliates, setMasterAffiliates] = useState([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterAffiliatesLoading, setMasterAffiliatesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const viewAffiliateDetails = async (affiliateId) => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/affiliates/${affiliateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch affiliate details');
      }

      const data = await response.json();
      setSelectedAffiliate(data);
      await fetchMasterAffiliates(affiliateId);
    } catch (err) {
      setError(err.message);
      toast.error('Error fetching affiliate details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterAffiliates = async (superAffiliateId) => {
    try {
      setMasterAffiliatesLoading(true);
      const response = await axios.get(`${base_url}/api/admin/all-master-affiliate/${superAffiliateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        setMasterAffiliates(response.data.data);
        setFilteredAffiliates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching master affiliates:', error);
      toast.error('Error fetching master affiliates');
    } finally {
      setMasterAffiliatesLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const handleViewMasterDetails = (masterId) => {
    navigate(`/admin/affiliates/${masterId}`);
  };

  // Search functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    const filtered = masterAffiliates.filter(
      (affiliate) =>
        `${affiliate.firstName} ${affiliate.lastName}`.toLowerCase().includes(query) ||
        affiliate.email.toLowerCase().includes(query)
    );
    setFilteredAffiliates(filtered);
  };

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredAffiliates].sort((a, b) => {
      if (key === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (key === 'email') {
        return direction === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
      } else if (key === 'totalEarnings') {
        const earningsA = a.masterEarnings?.totalEarnings || 0;
        const earningsB = b.masterEarnings?.totalEarnings || 0;
        return direction === 'asc' ? earningsA - earningsB : earningsB - earningsA;
      } else if (key === 'createdAt') {
        return direction === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    setFilteredAffiliates(sorted);
  };

  // Pagination
  const paginatedAffiliates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAffiliates.slice(start, start + itemsPerPage);
  }, [filteredAffiliates, currentPage]);

  const totalPages = Math.ceil(filteredAffiliates.length / itemsPerPage);

  useEffect(() => {
    if (id) {
      viewAffiliateDetails(id);
    }
  }, [id]);


  return (
    <section className="font-nunito min-h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          className={`transition-all duration-300 flex-1 p-8 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          {/* Affiliate Details Card */}
          <div className="w-full mx-auto bg-white border-[1px] border-gray-200  p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Affiliate Details</h1>
            </div>

            {/* Personal Information */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaUser className="mr-3 text-blue-600" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-gray-700"><strong className="font-medium">Name:</strong> {selectedAffiliate.firstName} {selectedAffiliate.lastName}</p>
                  <p className="text-gray-700"><strong className="font-medium">Email:</strong> {selectedAffiliate.email}</p>
                  <p className="text-gray-700"><strong className="font-medium">Phone:</strong> {selectedAffiliate.phone}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700"><strong className="font-medium">Country:</strong> {selectedAffiliate.address.country}</p>
                  <p className="text-gray-700"><strong className="font-medium">Role:</strong> {selectedAffiliate.role}</p>
                  <p className="text-gray-700"><strong className="font-medium">Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedAffiliate.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedAffiliate.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Information */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaMoneyBillWave className="mr-3 text-blue-600" /> Earnings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Earnings', value: formatCurrency(selectedAffiliate.totalEarnings || 0) },
                  { label: 'Pending Earnings', value: formatCurrency(selectedAffiliate.pendingEarnings || 0) },
                  { label: 'Paid Earnings', value: formatCurrency(selectedAffiliate.paidEarnings || 0) }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-sm">
                    <p className="text-gray-700 font-medium">{item.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaCreditCard className="mr-3 text-blue-600" /> Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-gray-700"><strong className="font-medium">Payment Method:</strong> {selectedAffiliate.paymentMethod}</p>
                  <p className="text-gray-700"><strong className="font-medium">Minimum Payout:</strong> {formatCurrency(selectedAffiliate.minimumPayout || 0)}</p>
                  <p className="text-gray-700"><strong className="font-medium">Payout Schedule:</strong> {selectedAffiliate.payoutSchedule}</p>
                </div>
                <div className="space-y-3">
                  {selectedAffiliate.paymentMethod === 'bkash' && (
                    <p className="text-gray-700"><strong className="font-medium">Bkash Number:</strong> {selectedAffiliate.paymentDetails?.bkash?.phoneNumber}</p>
                  )}
                  <p className="text-gray-700"><strong className="font-medium">Commission Type:</strong> {selectedAffiliate.commissionType}</p>
                  <p className="text-gray-700"><strong className="font-medium">Commission Rate:</strong> {(selectedAffiliate.commissionRate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {/* Referral Statistics */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaUsers className="mr-3 text-blue-600" /> Referral Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Referrals', value: selectedAffiliate.referralCount || 0 },
                  { label: 'Active Referrals', value: selectedAffiliate.activeReferrals || 0 },
                  { label: 'Average Earning/Referral', value: formatCurrency(selectedAffiliate.averageEarningPerReferral?.toFixed(2) || 0) }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-sm">
                    <p className="text-gray-700 font-medium">{item.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Master Affiliates Table */}
          <div className="w-full border-[1px] border-gray-200 mx-auto bg-white  p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Master Affiliates Created</h2>
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Total: {masterAffiliates.length}
              </span>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {masterAffiliatesLoading ? (
              <div className="flex justify-center items-center py-8">
                <FaSpinner className="animate-spin text-blue-600 text-3xl" />
                <span className="ml-2 text-gray-700 font-medium">Loading master affiliates...</span>
              </div>
            ) : filteredAffiliates.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          { label: 'Name', key: 'name' },
                          { label: 'Email', key: 'email' },
                          { label: 'Phone', key: null },
                          { label: 'Total Earnings', key: 'totalEarnings' },
                          { label: 'Status', key: null },
                          { label: 'Created Date', key: 'createdAt' },
                          { label: 'Actions', key: null }
                        ].map((header, index) => (
                          <th
                            key={index}
                            className="py-4 px-6 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                            onClick={header.key ? () => handleSort(header.key) : null}
                          >
                            <div className="flex items-center">
                              {header.label}
                              {header.key && (
                                <FaSort className={`ml-2 text-gray-400 ${sortConfig.key === header.key ? 'text-blue-600' : ''}`} />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAffiliates.map((master) => (
                        <tr key={master._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 text-sm text-gray-700">
                            {master.firstName} {master.lastName}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">{master.email}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{master.phone}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {formatCurrency(master.masterEarnings?.totalEarnings || 0)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              master.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {master.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {formatDate(master.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleViewMasterDetails(master._id)}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              <FaEye className="mr-2" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {paginatedAffiliates.length} of {filteredAffiliates.length} affiliates
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FaUsers className="mx-auto text-gray-400 text-4xl mb-4" />
                <p className="text-gray-600">No master affiliates found for this super affiliate.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
};

export default AffiliateDetails;