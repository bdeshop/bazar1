import React, { useState } from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import ConfirmationPopup from '../../components/modal/ConfirmationPopup';
import toast from 'react-hot-toast';

const Commission = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedCommissionId, setSelectedCommissionId] = useState(null);
  const usersPerPage = 5;

  const commissions = [
    {
      id: 1,
      referredUser: 'Michael Chen',
      email: 'michael.chen@example.com',
      commissionAmount: 50.00,
      status: 'paid',
      date: '2025-01-20',
    },
    {
      id: 2,
      referredUser: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      commissionAmount: 75.00,
      status: 'pending',
      date: '2025-02-15',
    },
    {
      id: 3,
      referredUser: 'David Kim',
      email: 'david.kim@example.com',
      commissionAmount: 30.00,
      status: 'pending',
      date: '2025-03-10',
    },
    {
      id: 4,
      referredUser: 'Emily Davis',
      email: 'emily.davis@example.com',
      commissionAmount: 100.00,
      status: 'paid',
      date: '2024-12-05',
    },
    {
      id: 5,
      referredUser: 'James Patel',
      email: 'james.patel@example.com',
      commissionAmount: 45.00,
      status: 'paid',
      date: '2025-01-30',
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle search
  const filteredCommissions = commissions.filter(
    (commission) =>
      commission.referredUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalCommissions = filteredCommissions.length;
  const totalPages = Math.ceil(totalCommissions / usersPerPage);
  const indexOfLastCommission = currentPage * usersPerPage;
  const indexOfFirstCommission = indexOfLastCommission - usersPerPage;
  const currentCommissions = filteredCommissions.slice(indexOfFirstCommission, indexOfLastCommission);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle view details action
  const handleViewDetails = (id) => {
    toast.success(`View details for commission with ID: ${id}`);
  };

  // Handle delete action
  const handleDelete = (id) => {
    setSelectedCommissionId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    setCommissions((prev) => prev.filter((commission) => commission.id !== selectedCommissionId));
    setShowDeletePopup(false);
    setSelectedCommissionId(null);
    toast.success('Commission record deleted successfully');
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setSelectedCommissionId(null);
  };

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
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Commission Records</h2>
                <p className="text-sm text-gray-500">Total: {totalCommissions} commissions</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search commissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
            </div>

            {/* Commissions Table */}
            {totalCommissions === 0 ? (
              <div className="text-center text-gray-500">No commission records found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 font-semibold text-gray-800">Referred User</th>
                        <th className="p-3 font-semibold text-gray-800">Email</th>
                        <th className="p-3 font-semibold text-gray-800">Commission Amount</th>
                        <th className="p-3 font-semibold text-gray-800">Status</th>
                        <th className="p-3 font-semibold text-gray-800">Date</th>
                        <th className="p-3 font-semibold text-gray-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCommissions.map((commission) => (
                        <tr
                          key={commission.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-3">{commission.referredUser || 'N/A'}</td>
                          <td className="p-3">{commission.email || 'N/A'}</td>
                          <td className="p-3">${commission.commissionAmount.toFixed(2)}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                commission.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : commission.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {commission.status || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            {commission.date
                              ? new Date(commission.date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleViewDetails(commission.id)}
                              className="text-green-600 hover:text-green-800"
                              title="View Details"
                            >
                              <FaEye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(commission.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstCommission + 1} to {Math.min(indexOfLastCommission, totalCommissions)} of {totalCommissions} commissions
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <ConfirmationPopup
          title="Delete Commission Record"
          message="Are you sure you want to delete this commission record? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </section>
  );
};

export default Commission;