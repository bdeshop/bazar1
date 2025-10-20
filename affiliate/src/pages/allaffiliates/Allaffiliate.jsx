import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import toast from 'react-hot-toast';

const Allaffiliate = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const referredUsers = [
    {
      id: 1,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      status: 'active',
      joinedDate: '2025-01-20',
    },
    {
      id: 2,
      name: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      status: 'active',
      joinedDate: '2025-02-15',
    },
    {
      id: 3,
      name: 'David Kim',
      email: 'david.kim@example.com',
      status: 'pending',
      joinedDate: '2025-03-10',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      status: 'inactive',
      joinedDate: '2024-12-05',
    },
    {
      id: 5,
      name: 'James Patel',
      email: 'james.patel@example.com',
      status: 'active',
      joinedDate: '2025-01-30',
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle search
  const filteredUsers = referredUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Placeholder for view details action
  const handleViewDetails = (id) => {
    toast.success(`View details for user with ID: ${id}`);
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
                <h2 className="text-2xl font-semibold text-gray-800">Referred Users</h2>
                <p className="text-sm text-gray-500">Total: {totalUsers} users</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search referred users..."
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

            {/* Referred Users Table */}
            {totalUsers === 0 ? (
              <div className="text-center text-gray-500">No referred users found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 font-semibold text-gray-800">Name</th>
                        <th className="p-3 font-semibold text-gray-800">Email</th>
                        <th className="p-3 font-semibold text-gray-800">Status</th>
                        <th className="p-3 font-semibold text-gray-800">Joined Date</th>
                        <th className="p-3 font-semibold text-gray-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-3">{user.name || 'N/A'}</td>
                          <td className="p-3">{user.email || 'N/A'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : user.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            {user.joinedDate
                              ? new Date(user.joinedDate).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleViewDetails(user.id)}
                              className="text-green-600 hover:text-green-800"
                              title="View Details"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
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
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, totalUsers)} of {totalUsers} users
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
    </section>
  );
};

export default Allaffiliate;