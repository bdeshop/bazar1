import React, { useState, useEffect } from "react";
import { Header } from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

const Withdraw = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [withdrawMethods, setWithdrawMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  // Fetch withdraw methods
  useEffect(() => {
    const fetchWithdrawMethods = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/withdraw-methods`);
        if (response.data.success && response.data.method) {
          setWithdrawMethods(response.data.method);
          // Set the first method as active
          if (response.data.method.length > 0) {
            setActiveMethod(response.data.method[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching withdraw methods:", err);
        setError("Failed to load withdraw methods");
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchWithdrawMethods();
  }, [API_BASE_URL]);

  useEffect(() => {
    // Fetch user data and withdrawal history
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
          return;
        }

        // Fetch user information
        const userResponse = await axios.get(
          `${API_BASE_URL}/api/user/all-information/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (userResponse.data.success) {
          setUserData(userResponse.data.data);
        } else {
          setError(userResponse.data.message);
        }

        // Fetch withdrawal history
        try {
          const historyResponse = await axios.get(
            `${API_BASE_URL}/api/user/withdraw/history/${user.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (historyResponse.data.success) {
            setWithdrawalHistory(historyResponse.data.data);
          }
        } catch (historyError) {
          console.error("Error fetching withdrawal history:", historyError);
          // If withdrawal history endpoint doesn't exist yet, use empty array
          setWithdrawalHistory([]);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  // Generate payment instructions dynamically based on method data
  const getPaymentInstructions = (method) => {
    if (!method) return [];
    
    const baseInstructions = [
      {
        step: "Prepare Account",
        description: `Ensure your ${method.gatewayName} account is active and verified.`,
      },
      {
        step: "Enter Details",
        description: `Provide your ${method.gatewayName} account number correctly.`,
      },
      { 
        step: "Enter Amount", 
        description: `Input the withdrawal amount (Min: ৳${method.minAmount}, Max: ৳${method.maxAmount}).` 
      },
      {
        step: "Review Charges",
        description: `Note: ${method.fixedCharge}৳ fixed + ${method.percentCharge}% charge will be applied.`,
      },
      {
        step: "Submit Request",
        description: "Submit your withdrawal request for processing.",
      },
    ];

    return baseInstructions;
  };

  // Calculate charges and final amount
  const calculateCharges = () => {
    if (!amount || !activeMethod) return { charge: 0, finalAmount: 0, youWillGet: 0 };
    
    const amountNum = parseFloat(amount);
    const fixedCharge = parseFloat(activeMethod.fixedCharge) || 0;
    const percentCharge = parseFloat(activeMethod.percentCharge) || 0;
    
    const percentAmount = (amountNum * percentCharge) / 100;
    const totalCharge = fixedCharge + percentAmount;
    const finalAmount = amountNum - totalCharge;
    const youWillGet = amountNum - totalCharge;
    
    return {
      charge: totalCharge,
      finalAmount: finalAmount,
      youWillGet: youWillGet,
      fixedCharge,
      percentCharge: percentAmount
    };
  };

  const charges = calculateCharges();

  const validateForm = () => {
    const errors = {};

    if (!activeMethod) {
      errors.method = "Please select a payment method";
    }

    // Phone validation
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Account number is required";
    } else if (activeMethod?.gatewayName.toLowerCase().includes('bkash') || 
               activeMethod?.gatewayName.toLowerCase().includes('nagad') ||
               activeMethod?.gatewayName.toLowerCase().includes('rocket') ||
               activeMethod?.gatewayName.toLowerCase().includes('upay')) {
      if (!/^01[3-9]\d{8}$/.test(phoneNumber)) {
        errors.phoneNumber = "Please enter a valid Bangladeshi phone number";
      }
    }

    // Amount validation
    if (!amount) {
      errors.amount = "Amount is required";
    } else if (parseFloat(amount) < parseFloat(activeMethod?.minAmount || 100)) {
      errors.amount = `Minimum withdrawal amount is ৳${activeMethod?.minAmount || 100}`;
    } else if (parseFloat(amount) > parseFloat(activeMethod?.maxAmount || 30000)) {
      errors.amount = `Maximum withdrawal amount is ৳${activeMethod?.maxAmount || 30000}`;
    } else if (parseFloat(amount) > (userData?.balance || 0)) {
      errors.amount = "Insufficient balance for this withdrawal";
    } else if (!/^\d+$/.test(amount)) {
      errors.amount = "Amount must be a whole number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      // API call for withdrawal
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/user/withdraw`,
        {
          userId: user.id,
          method: activeMethod.gatewayName,
          methodId: activeMethod._id,
          accountNumber: phoneNumber,
          amount: parseFloat(amount),
          charge: charges.charge,
          finalAmount: charges.finalAmount,
          currency: activeMethod.currencyName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setTransactionStatus({
          success: true,
          message:
            response.data.message || "Withdrawal request submitted successfully! It will be processed shortly.",
        });

        // Update user balance locally
        setUserData({
          ...userData,
          balance: userData.balance - parseFloat(amount),
        });

        // Add to withdrawal history
        const newWithdrawal = {
          method: activeMethod.gatewayName,
          amount: parseFloat(amount),
          finalAmount: charges.finalAmount,
          charge: charges.charge,
          date: new Date(),
          status: "pending",
          accountNumber: phoneNumber,
          createdAt: new Date().toISOString(),
        };

        setWithdrawalHistory((prev) => [newWithdrawal, ...prev]);

        // Reset form
        setPhoneNumber("");
        setAmount("");
      } else {
        setTransactionStatus({
          success: false,
          message:
            response.data.message || "Withdrawal failed. Please try again.",
        });
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      let errorMessage = "Withdrawal failed. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setTransactionStatus({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/user/all-information/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (err) {
      console.error("Error refreshing balance:", err);
      setError("Failed to refresh balance");
    }
  };

  // Helper function to render payment method buttons dynamically
  const renderPaymentMethodButton = (method) => (
    <button
      type="button"
      key={method._id}
      className={`px-3 py-3 md:px-4 md:py-4 rounded-lg flex flex-col items-center justify-center transition-all ${
        activeMethod?._id === method._id
          ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
          : "bg-[#1a1f1f] hover:bg-[#1f2525] border-2 border-transparent"
      }`}
      onClick={() => setActiveMethod(method)}
    >
      <img
        src={`${API_BASE_URL}/uploads/${method.image}`}
        alt={method.gatewayName}
        className="w-8 h-8 md:w-10 md:h-10 mb-1 md:mb-2 object-contain"
      />
      <span className="text-xs font-medium">{method.gatewayName}</span>
    </button>
  );

  if (error && !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0f0f]">
        <div className="bg-[#1a1f1f] text-[#ff6b6b] p-6 rounded-lg max-w-md text-center border border-[#2a2f2f]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#2a5c45] hover:bg-[#3a6c55] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-rubik bg-[#0a0f0f] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex overflow-y-auto h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="max-w-6xl mx-auto py-4 md:py-8 pb-[30px]  p-3 md:p-0">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white">
                Withdraw Funds
              </h1>
              <p className="text-sm md:text-base text-[#8a9ba8]">
                Withdraw money from your account to mobile banking
              </p>
            </div>

            {/* User Info Card */}
            {userData && (
              <div className="bg-[#1a1f1f] rounded-[2px] p-4 md:p-6 mb-6 md:mb-8 border border-[#2a2f2f] shadow-lg">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">Player ID</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.player_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">Username</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">Phone</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-[#1a2525] to-[#2a3535] rounded-[2px] p-4 md:p-6 mb-6 md:mb-8 shadow-lg border border-[#2a2f2f]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <div>
                  <p className="text-xs md:text-sm text-[#a8b9c6]">
                    Current Balance
                  </p>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                    ৳ {userData ? userData.balance?.toLocaleString() : "0.00"}
                  </h2>
                </div>
                <button
                  onClick={handleRefreshBalance}
                  className="bg-[#2a5c45] cursor-pointer px-4 py-2 md:px-6 md:py-3 rounded-[5px] text-xs md:text-sm font-medium transition-colors flex items-center hover:bg-[#3a6c55]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Balance
                </button>
              </div>
            </div>

            {/* Loading State for Withdraw Methods */}
            {loadingMethods ? (
          <div className="bg-[#1a1f1f] rounded-lg p-8 text-center border border-[#2a2f2f]">
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[#2a2f2f] rounded-full"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full border-t-[#3a8a6f] animate-spin"></div>
    </div>
    <div>
      <p className="text-[#8a9ba8] font-medium">Loading withdrawal methods</p>
    </div>
  </div>
</div>
            ) : withdrawMethods.length === 0 ? (
              <div className="bg-[#1a1f1f] rounded-[2px] p-8 text-center border border-[#2a2f2f]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-[#8a9ba8] mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#8a9ba8]">No withdrawal methods available at the moment.</p>
              </div>
            ) : (
              /* Withdrawal Methods */
              <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden mb-6 md:mb-8 border border-[#2a2f2f]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 md:p-4 border-b border-[#2a2f2f]">
                  {withdrawMethods.map((method) => renderPaymentMethodButton(method))}
                </div>

                {activeMethod && (
                  <>
                    {/* Payment Instructions */}
                    <div className="p-4 md:p-6 border-t border-[#2a2f2f]">
                      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#3a8a6f]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {activeMethod.gatewayName} Withdrawal Instructions
                      </h3>
                      <ul className="text-xs md:text-sm text-[#8a9ba8] space-y-2 md:space-y-3">
                        {getPaymentInstructions(activeMethod).map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[#3a8a6f] mr-2">•</span>
                            <span>
                              <strong>{step.step}:</strong> {step.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Charges Information */}
                    <div className="p-4 md:p-6 border-t border-[#2a2f2f] bg-[#1f2525]">
                      <h4 className="text-sm md:text-base font-semibold mb-3 text-white">
                        Charges Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                        <div>
                          <p className="text-[#8a9ba8]">Fixed Charge</p>
                          <p className="text-white font-medium">৳{activeMethod.fixedCharge}</p>
                        </div>
                        <div>
                          <p className="text-[#8a9ba8]">Percent Charge</p>
                          <p className="text-white font-medium">{activeMethod.percentCharge}%</p>
                        </div>
                        <div>
                          <p className="text-[#8a9ba8]">Min Amount</p>
                          <p className="text-white font-medium">৳{activeMethod.minAmount}</p>
                        </div>
                        <div>
                          <p className="text-[#8a9ba8]">Max Amount</p>
                          <p className="text-white font-medium">৳{activeMethod.maxAmount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="p-4 md:p-6">
                      <form onSubmit={handleSubmit}>
                        {/* Dynamic Form Fields from userData */}
                        {activeMethod.userData && activeMethod.userData.map((field, index) => (
                          <div key={field._id} className="mb-4 md:mb-6">
                            <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                              {field.label}
                              {field.isRequired === "required" && (
                                <span className="text-[#ff6b6b] ml-1">*</span>
                              )}
                            </label>
                            <input
                              type={field.type}
                              className={`w-full bg-[#1f2525] border rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-[#5a6b78] focus:outline-none focus:ring-2 focus:ring-[#3a8a6f] ${
                                formErrors.phoneNumber
                                  ? "border-[#ff6b6b]"
                                  : "border-[#2a2f2f]"
                              }`}
                              placeholder={`Enter your ${activeMethod.gatewayName} ${field.label.toLowerCase()}`}
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              required={field.isRequired === "required"}
                            />
                            {field.instruction && (
                              <p className="text-xs text-[#8a9ba8] mt-1">{field.instruction}</p>
                            )}
                            {formErrors.phoneNumber && (
                              <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                                {formErrors.phoneNumber}
                              </p>
                            )}
                          </div>
                        ))}

                        {/* Amount Field */}
                        <div className="mb-4 md:mb-6">
                          <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                            Amount (৳)
                            <span className="text-[#ff6b6b] ml-1">*</span>
                          </label>
                          <input
                            type="number"
                            className={`w-full bg-[#1f2525] border rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-[#5a6b78] focus:outline-none focus:ring-2 focus:ring-[#3a8a6f] ${
                              formErrors.amount
                                ? "border-[#ff6b6b]"
                                : "border-[#2a2f2f]"
                            }`}
                            placeholder={`Enter amount (Min: ৳${activeMethod.minAmount}, Max: ৳${activeMethod.maxAmount})`}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={activeMethod.minAmount}
                            max={Math.min(activeMethod.maxAmount, userData?.balance || 0)}
                            required
                          />
                          {formErrors.amount && (
                            <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                              {formErrors.amount}
                            </p>
                          )}

                          {/* Amount Breakdown */}
                          {amount && (
                            <div className="mt-3 p-3 bg-[#1f2525] rounded-lg border border-[#2a2f2f]">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-[#8a9ba8]">Withdrawal Amount:</p>
                                  <p className="text-white font-medium">৳{parseFloat(amount).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[#8a9ba8]">Total Charge:</p>
                                  <p className="text-red-400 font-medium">-৳{charges.charge.toFixed(2)}</p>
                                </div>
                                <div className="col-span-2 border-t border-[#2a2f2f] mt-2 pt-2">
                                  <p className="text-[#8a9ba8]">You Will Get:</p>
                                  <p className="text-[#3a8a6f] font-bold">৳{charges.youWillGet.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                            {quickAmounts.map((quickAmount) => (
                              <button
                                key={quickAmount}
                                type="button"
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                  amount === quickAmount.toString()
                                    ? "bg-[#2a5c45] text-white"
                                    : "bg-[#1f2525] text-[#8a9ba8] hover:bg-[#252b2b]"
                                }`}
                                onClick={() => setAmount(quickAmount.toString())}
                                disabled={quickAmount > (userData?.balance || 0) || quickAmount > activeMethod.maxAmount || quickAmount < activeMethod.minAmount}
                              >
                                ৳ {quickAmount.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          className="w-full bg-gradient-to-r from-[#2a5c45] to-[#3a6c55] hover:from-[#3a6c55] hover:to-[#4a7c65] py-3 md:py-4 rounded-lg text-sm md:text-base text-white font-medium flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          type="submit"
                          disabled={
                            isProcessing ||
                            !phoneNumber.trim() ||
                            !amount ||
                            parseFloat(amount) > (userData?.balance || 0) ||
                            parseFloat(amount) < parseFloat(activeMethod?.minAmount || 100) ||
                            parseFloat(amount) > parseFloat(activeMethod?.maxAmount || 30000)
                          }
                        >
                          {isProcessing ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            `Withdraw to ${activeMethod.gatewayName}`
                          )}
                        </button>
                      </form>

                      {transactionStatus && (
                        <div
                          className={`mt-3 md:mt-4 p-3 md:p-4 rounded-lg text-xs md:text-sm ${
                            transactionStatus.success
                              ? "bg-[#1a2525] text-[#4ecdc4] border border-[#2a3535]"
                              : "bg-[#2a1f1f] text-[#ff6b6b] border border-[#3a2f2f]"
                          }`}
                        >
                          <div className="flex items-center">
                            {transactionStatus.success ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 md:h-5 md:w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 md:h-5 md:w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {transactionStatus.message}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Instructions and Transaction History in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
              {/* Instructions */}
              {activeMethod && (
                <div className="bg-[#1a1f1f] rounded-[2px] p-4 md:p-6 border border-[#2a2f2f]">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#3a8a6f]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Withdrawal Information
                  </h3>
                  <ul className="text-xs md:text-sm text-[#8a9ba8] space-y-2 md:space-y-3">
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Minimum withdrawal amount: ৳{activeMethod?.minAmount || 100}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Maximum withdrawal amount: ৳{activeMethod?.maxAmount || 30000}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Fixed charge: ৳{activeMethod?.fixedCharge || 0}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Percent charge: {activeMethod?.percentCharge || 0}%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Withdrawal processing time: 5-30 minutes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Ensure your account is active and verified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>Contact support if you face any issues</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Transaction History */}
              <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden border border-[#2a2f2f]">
                <div className="p-4 md:p-6 border-b border-[#2a2f2f] flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    Recent Withdrawals
                  </h3>
                  <button className="text-[#3a8a6f] text-xs md:text-sm hover:text-[#4a9a7f] transition-colors">
                    View All
                  </button>
                </div>
                <div className="p-3 md:p-4">
                  {withdrawalHistory.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {withdrawalHistory
                        .slice(0, 5)
                        .map((transaction, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-[#1f2525] rounded-lg hover:bg-[#252b2b] transition-colors"
                          >
                            <div className="flex items-center">
                              <div
                                className={`p-1.5 md:p-2 rounded-full mr-2 md:mr-3 ${
                                  transaction.status === "completed"
                                    ? "bg-[#1a2525] text-[#4ecdc4]"
                                    : transaction.status === "pending"
                                    ? "bg-[#2a2a1f] text-[#e6db74]"
                                    : "bg-[#2a1f1f] text-[#ff6b6b]"
                                }`}
                              >
                                {transaction.status === "completed" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : transaction.status === "pending" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-xs md:text-sm font-medium text-white">
                                  {new Date(
                                    transaction.date || transaction.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-[#8a9ba8] capitalize">
                                  {transaction.method}
                                </p>
                                {transaction.accountNumber && (
                                  <p className="text-xs text-[#8a9ba8]">
                                    {transaction.accountNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs md:text-sm font-medium text-white">
                                ৳ {transaction.amount?.toLocaleString()}
                              </p>
                              {transaction.finalAmount && transaction.amount !== transaction.finalAmount && (
                                <p className="text-xs text-[#8a9ba8]">
                                  Get: ৳{transaction.finalAmount?.toLocaleString()}
                                </p>
                              )}
                              <p
                                className={`text-xs ${
                                  transaction.status === "completed"
                                    ? "text-[#4ecdc4]"
                                    : transaction.status === "pending"
                                    ? "text-[#e6db74]"
                                    : "text-[#ff6b6b]"
                                }`}
                              >
                                {transaction.status?.charAt(0).toUpperCase() +
                                  transaction.status?.slice(1)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center flex justify-center items-center flex-col py-6 md:py-8 text-[#8a9ba8]">
                      <div className="w-[40px] h-[40px] flex justify-center items-center border-[2px] border-[#2a2f2f] mb-[10px] rounded-full">
                        <FaBangladeshiTakaSign className="text-[#5a6b78]" />
                      </div>
                      <p className="text-sm md:text-base">
                        No recent withdrawals
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Withdraw;