import React, { useState, useEffect } from 'react';
import { FaUser, FaMoneyBillWave, FaCreditCard, FaUsers, FaTimes } from 'react-icons/fa';
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
  const [error, setError] = useState(null);
  const [showStatusToast, setShowStatusToast] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const viewAffiliateDetails = async (affiliateId) => {
    try {
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
    } catch (err) {
      setError(err.message);
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
      toast.error('Error fetching affiliate details');
    }
  };

  useEffect(() => {
    if (id) {
      viewAffiliateDetails(id);
    }
  }, [id]);

  if (!selectedAffiliate) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
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
          <div className="w-full mx-auto bg-white rounded-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Affiliate Details</h1>
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaUser className="mr-2" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600"><strong>Name:</strong> {selectedAffiliate.firstName} {selectedAffiliate.lastName}</p>
                  <p className="text-gray-600"><strong>Email:</strong> {selectedAffiliate.email}</p>
                  <p className="text-gray-600"><strong>Phone:</strong> {selectedAffiliate.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600"><strong>Country:</strong> {selectedAffiliate.address.country}</p>
                  <p className="text-gray-600"><strong>Role:</strong> {selectedAffiliate.role}</p>
                  <p className="text-gray-600"><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-white ${
                      selectedAffiliate.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {selectedAffiliate.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaMoneyBillWave className="mr-2" /> Earnings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Total Earnings:</strong> {selectedAffiliate.totalEarnings} BDT</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Pending Earnings:</strong> {selectedAffiliate.pendingEarnings} BDT</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Paid Earnings:</strong> {selectedAffiliate.paidEarnings} BDT</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaCreditCard className="mr-2" /> Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600"><strong>Payment Method:</strong> {selectedAffiliate.paymentMethod}</p>
                  <p className="text-gray-600"><strong>Minimum Payout:</strong> {selectedAffiliate.minimumPayout} BDT</p>
                  <p className="text-gray-600"><strong>Payout Schedule:</strong> {selectedAffiliate.payoutSchedule}</p>
                </div>
                <div>
                  {selectedAffiliate.paymentMethod === 'bkash' && (
                    <p className="text-gray-600"><strong>Bkash Number:</strong> {selectedAffiliate.paymentDetails.bkash.phoneNumber}</p>
                  )}
                  <p className="text-gray-600"><strong>Commission Type:</strong> {selectedAffiliate.commissionType}</p>
                  <p className="text-gray-600"><strong>Commission Rate:</strong> {(selectedAffiliate.commissionRate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {/* Referral Statistics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaUsers className="mr-2" /> Referral Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Total Referrals:</strong> {selectedAffiliate.referralCount}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Active Referrals:</strong> {selectedAffiliate.activeReferrals}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600"><strong>Average Earning/Referral:</strong> {selectedAffiliate.averageEarningPerReferral.toFixed(2)} BDT</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default AffiliateDetails;