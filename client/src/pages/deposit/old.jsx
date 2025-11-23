import React, { useState, useEffect } from "react";
import { Header } from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Deposit = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const [activeMethod, setActiveMethod] = useState("bkash");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [transactionId, setTransactionId] = useState("");
  const [selectedBonus, setSelectedBonus] = useState("none");
  const navigate=useNavigate();
  const quickAmounts = [300, 500, 1000, 2000, 5000];
  const MIN_DEPOSIT = 300;
  const MAX_DEPOSIT = 50000;

  // Payment method instructions
  const paymentGuides = {
    bkash: [
      {
        step: "Dial",
        description: "Open your phone's dialer and enter *247#.",
      },
      {
        step: "Select Option",
        description: "Choose 'Send Money' and enter 01889921959.",
      },
      { step: "Enter Amount", description: "Input the deposit amount." },
      {
        step: "Confirm with PIN",
        description: "Enter your bKash PIN to confirm.",
      },
      {
        step: "Copy Transaction ID",
        description: "Save the transaction ID from the confirmation message.",
      },
    ],
    nagad: [
      {
        step: "Dial",
        description: "Open your phone's dialer and enter *167#.",
      },
      {
        step: "Select Option",
        description: "Choose 'Send Money' and enter 01889921959",
      },
      { step: "Enter Amount", description: "Input the deposit amount." },
      {
        step: "Confirm with PIN",
        description: "Enter your Nagad PIN to confirm.",
      },
      {
        step: "Copy Transaction ID",
        description: "Save the transaction ID from the confirmation message.",
      },
    ],
    rocket: [
      {
        step: "Dial",
        description: "Open your phone's dialer and enter *322#.",
      },
      {
        step: "Select Option",
        description: "Choose 'Send Money' and enter the 01889921959",
      },
      { step: "Enter Amount", description: "Input the deposit amount." },
      {
        step: "Confirm with PIN",
        description: "Enter your Rocket PIN to confirm.",
      },
      {
        step: "Copy Transaction ID",
        description: "Save the transaction ID from the confirmation message.",
      },
    ],
    upay: [
      {
        step: "Dial",
        description: "Open your phone's dialer and enter *268#.",
      },
      {
        step: "Select Option",
        description: "Choose 'Send Money' and enter the 01889921959",
      },
      { step: "Enter Amount", description: "Input the deposit amount." },
      {
        step: "Confirm with PIN",
        description: "Enter your Upay PIN to confirm.",
      },
      {
        step: "Copy Transaction ID",
        description: "Save the transaction ID from the confirmation message.",
      },
    ],
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.get(
          `${API_BASE_URL}/api/user/all-information/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validateForm = () => {
    const errors = {};

    // Phone validation
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^01[3-9]\d{8}$/.test(phoneNumber)) {
      errors.phoneNumber = "Please enter a valid Bangladeshi phone number";
    }

    // Amount validation
    if (!amount) {
      errors.amount = "Amount is required";
    } else if (parseFloat(amount) < MIN_DEPOSIT) {
      errors.amount = `Minimum deposit amount is ৳${MIN_DEPOSIT}`;
    } else if (parseFloat(amount) > MAX_DEPOSIT) {
      errors.amount = `Maximum deposit amount is ৳${MAX_DEPOSIT}`;
    } else if (!/^\d+$/.test(amount)) {
      errors.amount = "Amount must be a whole number";
    }

    // Transaction ID validation for all methods
    if (!transactionId.trim()) {
      errors.transactionId = "Transaction ID is required";
    } else if (transactionId.length < 5) {
      errors.transactionId = "Transaction ID must be at least 5 characters";
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
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const depositData = {
        method: activeMethod,
        phoneNumber,
        amount: parseFloat(amount),
        transactionId: transactionId,
        bonus: selectedBonus,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/user/deposit`,
        depositData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setTransactionStatus({
          success: true,
          message:
            response.data.message ||
            "Deposit request submitted successfully! Your balance will be updated after verification.",
        });

        // Update user data to reflect the new balance
        if (response.data.newBalance !== undefined) {
          setUserData((prev) => ({
            ...prev,
            balance: response.data.newBalance,
          }));
        }
        navigate("/");
        // Reset form
        setPhoneNumber("");
        setAmount("");
        setTransactionId("");
        setSelectedBonus("none");
      } else {
        throw new Error(response.data.message || "Deposit failed");
      }
    } catch (err) {
      console.error("Deposit error:", err);
      let errorMessage = "Deposit failed. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Helper function to render payment method buttons
  const renderPaymentMethodButton = (method, imgSrc, alt) => (
    <button
      type="button"
      className={`px-3 py-3 md:px-4 md:py-4 rounded-lg flex flex-col items-center justify-center transition-all ${
        activeMethod === method
          ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
          : "bg-[#1a1f1f] hover:bg-[#1f2525] border-2 border-transparent"
      }`}
      onClick={() => setActiveMethod(method)}
    >
      <img
        src={imgSrc}
        alt={alt}
        className={`w-8 h-8 md:w-10 md:h-10 mb-1 md:mb-2 object-contain ${
          method === "upay" ? "rounded-full" : ""
        }`}
      />
      <span className="text-xs font-medium">{alt}</span>
    </button>
  );

  if (error) {
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
    <div className="h-screen overflow-hidden bg-[#0a0f0f] text-white font-rubik">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        <div
          className={`flex-1 overflow-auto transition-all duration-300  ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="max-w-6xl mx-auto py-4 md:py-8 p-3 md:p-6">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white">
                Deposit Funds
              </h1>
              <p className="text-sm md:text-base text-[#8a9ba8]">
                Add money to your account using mobile banking
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
                  className="bg-[#2a5c45] px-4 py-2 cursor-pointer md:px-6 md:py-3 rounded-[5px] text-xs md:text-sm font-medium transition-colors flex items-center hover:bg-[#3a6c55]"
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

            {/* Payment Methods */}
            <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden mb-6 md:mb-8 border border-[#2a2f2f]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 md:p-4 border-b border-[#2a2f2f]">
                {renderPaymentMethodButton(
                  "bkash",
                  "https://xxxbetgames.com/icons-xxx/payments/75.svg",
                  "Bkash"
                )}
                {renderPaymentMethodButton(
                  "nagad",
                  "https://xxxbetgames.com/icons-xxx/payments/76.svg",
                  "Nagad"
                )}
                {renderPaymentMethodButton(
                  "rocket",
                  "https://i.ibb.co.com/gMyjnRgy/Rocket-mobile-banking-logo-svg.png",
                  "Rocket"
                )}
                {renderPaymentMethodButton(
                  "upay",
                  "https://i.ibb.co.com/Dfx6hxVf/upay-ucbfintech-logo.jpg",
                  "Upay"
                )}
              </div>

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
                  {activeMethod.charAt(0).toUpperCase() + activeMethod.slice(1)}{" "}
                  Payment Instructions
                </h3>
                <ul className="text-xs md:text-sm text-[#8a9ba8] space-y-2 md:space-y-3">
                  {paymentGuides[activeMethod].map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#3a8a6f] mr-2">•</span>
                      <span>
                        <strong>{step.step}:</strong> {step.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Form */}
              <div className="p-4 md:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4 md:mb-6">
                    <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                      Phone Number
                      <span className="text-[#ff6b6b] ml-1">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`w-full bg-[#1f2525] border rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-[#5a6b78] focus:outline-none focus:ring-2 focus:ring-[#3a8a6f] ${
                        formErrors.phoneNumber
                          ? "border-[#ff6b6b]"
                          : "border-[#2a2f2f]"
                      }`}
                      placeholder="Enter Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    {formErrors.phoneNumber && (
                      <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

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
                      placeholder={`Enter amount (Min: ৳${MIN_DEPOSIT}, Max: ৳${MAX_DEPOSIT})`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={MIN_DEPOSIT}
                      max={MAX_DEPOSIT}
                    />
                    {formErrors.amount && (
                      <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                        {formErrors.amount}
                      </p>
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
                        >
                          ৳ {quickAmount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transaction ID Field */}
                  <div className="mb-4 md:mb-6">
                    <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                      Transaction ID
                      <span className="text-[#ff6b6b] ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full bg-[#1f2525] border rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-[#5a6b78] focus:outline-none focus:ring-2 focus:ring-[#3a8a6f] ${
                        formErrors.transactionId
                          ? "border-[#ff6b6b]"
                          : "border-[#2a2f2f]"
                      }`}
                      placeholder="Enter transaction ID from your payment confirmation"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                    {formErrors.transactionId && (
                      <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                        {formErrors.transactionId}
                      </p>
                    )}
                    <p className="text-xs text-[#8a9ba8] mt-1">
                      You can find the transaction ID in your {activeMethod} confirmation message
                    </p>
                  </div>

                  {/* Bonus Selection */}
                  <div className="mb-4 md:mb-6">
                    <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                      Select Bonus
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`p-3 rounded-[5px] flex flex-col cursor-pointer items-center justify-center transition-all ${
                          selectedBonus === "5percent"
                            ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
                            : "bg-[#1f2525] hover:bg-[#252b2b] border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedBonus("5percent")}
                      >
                        <span className="text-sm md:text-base font-medium">
                          5% First Deposit Bonus
                        </span>
                        <span className="text-xs text-[#8a9ba8]">
                          For first-time deposits
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`p-3 rounded-[5px] cursor-pointer flex flex-col items-center justify-center transition-all ${
                          selectedBonus === "200percent"
                            ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
                            : "bg-[#1f2525] hover:bg-[#252b2b] border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedBonus("200percent")}
                      >
                        <span className="text-sm md:text-base font-medium">
                          200% Special Bonus
                        </span>
                        <span className="text-xs text-[#8a9ba8]">
                          Limited time offer
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`p-3 rounded-[5px] cursor-pointer flex flex-col items-center justify-center transition-all ${
                          selectedBonus === "none"
                            ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
                            : "bg-[#1f2525] hover:bg-[#252b2b] border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedBonus("none")}
                      >
                        <span className="text-sm md:text-base font-medium">
                          No Bonus
                        </span>
                        <span className="text-xs text-[#8a9ba8]">
                          Proceed without bonus
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-[#2a5c45] to-[#3a6c55] hover:from-[#3a6c55] hover:to-[#4a7c65] py-3 md:py-4 rounded-lg text-sm md:text-base text-white font-medium flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    type="submit"
                    disabled={isProcessing}
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
                      `Deposit with ${
                        activeMethod.charAt(0).toUpperCase() +
                        activeMethod.slice(1)
                      }`
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
            </div>

            {/* Instructions and Transaction History in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
              {/* Instructions */}
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
                  How to deposit with{" "}
                  {activeMethod.charAt(0).toUpperCase() + activeMethod.slice(1)}
                </h3>
                <ol className="text-xs md:text-sm text-[#8a9ba8] space-y-2 md:space-y-3 list-decimal list-inside">
                  <li>
                    Enter your mobile number registered with {activeMethod}
                  </li>
                  <li>
                    Enter the amount you want to deposit (minimum ৳{MIN_DEPOSIT}
                    )
                  </li>
                  <li>Complete the transaction in your {activeMethod} app</li>
                  <li>Copy the transaction ID from confirmation message</li>
                  <li>Paste the transaction ID in the form above</li>
                  <li>Select your preferred bonus option</li>
                  <li>Submit the deposit request</li>
                  <li>
                    Wait for confirmation (usually within a few minutes)
                  </li>
                </ol>
              </div>

              {/* Transaction History */}
              <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden border border-[#2a2f2f]">
                <div className="p-4 md:p-6 border-b border-[#2a2f2f] flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    Recent Transactions
                  </h3>
                  <button className="text-[#3a8a6f] text-xs md:text-sm hover:text-[#4a9a7f] transition-colors">
                    View All
                  </button>
                </div>
                <div className="p-3 md:p-4">
                  {userData &&
                  userData.depositHistory &&
                  userData.depositHistory.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {userData.depositHistory.map((transaction, index) => (
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
                                  transaction.createdAt
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-[#8a9ba8] capitalize">
                                {transaction.method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs md:text-sm font-medium text-white">
                              ৳ {transaction.amount?.toLocaleString()}
                            </p>
                            <p
                              className={`text-xs ${
                                transaction.status === "completed"
                                  ? "text-[#4ecdc4]"
                                  : transaction.status === "pending"
                                  ? "text-[#e6db74]"
                                  : "text-[#ff6b6b]"
                              }`}
                            >
                              {transaction.status}
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
                        No recent transactions
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

export default Deposit;