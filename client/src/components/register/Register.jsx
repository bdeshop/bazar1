import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import videoBackgroundUrl from "../../assets/mainvideo.mp4";
import { NavLink } from 'react-router-dom';
import logo from "../../assets/logo.png";

export default function Register() {
  const [currency, setCurrency] = useState("BDT");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [referralError, setReferralError] = useState("");
  const [isSignUpActive, setIsSignUpActive] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Check if referral code is valid
  const checkReferralCode = async () => {
    if (!referralCode) {
      setReferralError("Please enter a referral code");
      return;
    }

    setIsCheckingReferral(true);
    setReferralError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/check-referral/${referralCode}`);
      
      if (response.data.success) {
        setReferralValid(true);
        setReferrerInfo(response.data.referrer);
        toast.success("Referral code is valid!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Referral check error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid referral code';
      setReferralError(errorMessage);
      setReferralValid(false);
      setReferrerInfo(null);
    } finally {
      setIsCheckingReferral(false);
    }
  };

  // Handles the form submission logic for Sign Up Step 1
  const handleSignUpStep1 = (e) => {
    e.preventDefault();
    setPhoneError("");
    setReferralError("");

    if (!phone) {
      setPhoneError("Phone number is required.");
      return;
    }

    if (!/^1[0-9]{9}$/.test(phone)) {
      setPhoneError("Please enter a valid Bangladeshi phone number, starting with 1.");
      return;
    }

    // If referral code is provided but not validated
    if (referralCode && !referralValid) {
      setReferralError("Please validate your referral code first");
      return;
    }

    // Move to next step if validation passes
    setCurrentStep(2);
  };

  // Handles the form submission logic for Sign Up Step 2
  const handleSignUpStep2 = (e) => {
    e.preventDefault();
    setSignupError("");
    
    if (!username) {
      setSignupError("Username is required.");
      return;
    }
    
    // Username validation - no uppercase, spaces, or special symbols
    if (!/^[a-z0-9_]+$/.test(username)) {
      setSignupError("Username can only contain lowercase letters, numbers, and underscores.");
      return;
    }
    
    if (username.length < 3) {
      setSignupError("Username must be at least 3 characters long.");
      return;
    }

    // Move to next step if validation passes
    setCurrentStep(3);
  };

  // Handles the form submission logic for Sign Up Step 3
  const handleSignUpStep3 = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (!password) {
      setSignupError("Password is required.");
      return;
    }
    
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        currency,
        phone,
        username,
        password,
        confirmPassword,
        fullName,
        email,
        referralCode: referralValid ? referralCode : undefined
      });
      
      if(response.data.success){
        toast.success('Account created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Reset form
        setCurrentStep(1);
        setPhone("");
        setFullName("");
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setReferralCode("");
        setReferralValid(false);
        setReferrerInfo(null);

        // Redirect to dashboard or home page after successful signup
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast.error(`${response.data.message}`)
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      setSignupError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handles the form submission logic for Log In
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    if (!username) {
      setLoginError("Username is required.");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setLoginError("Password is required.");
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setLoginError("Username must be at least 3 characters long.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });
      
      if(response.data.success){
        toast.success('Login successful!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error(`${response.data.message}`)
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setLoginError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate progress percentage for the progress bar
  const getProgressPercentage = () => {
    return (currentStep - 1) / 2 * 100; // 3 steps total, so (currentStep-1)/2
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900  font-poppins text-white">
      {/* Toast Container */}
      <Toaster/>
      {/* Background Video */}
      <video className="md:flex hidden absolute top-0 left-0 w-full h-full object-cover" autoPlay loop muted>
        <source src={videoBackgroundUrl} type="video/mp4" />
      </video>

      {/* Header Section */}
      <header className="relative z-20 bg-[#141515] border-b-[1px] border-gray-700 bg-opacity-70 flex justify-between items-center px-4 py-3 md:px-8">
        <NavLink to="/">
          <img src={logo} alt="Logo" className="h-8 md:h-10 cursor-pointer" />
        </NavLink>
        
        {/* Home Icon */}
        <div className="flex items-center">
          <NavLink to="/">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </NavLink>
        </div>
      </header>
       <video className="md:hidden " autoPlay loop muted>
        <source src={videoBackgroundUrl} type="video/mp4" />
      </video>
      {/* Main Content */}
      <div className="relative flex justify-center md:justify-end items-center h-full md:min-h-[calc(100vh-76px)] md:p-6 lg:p-8 xl:p-[100px]">
        <div className="w-full px-[10px] md:px-0 md:max-w-lg   bg-opacity-80 overflow-hidden ">
          {/* Tab Navigation */}
          <div className="flex border-b  border-gray-700">
            <button 
              onClick={() => {setIsSignUpActive(false); setCurrentStep(1);}} 
              className={`flex-1 py-3 md:py-4 text-center text-sm md:text-base font-medium cursor-pointer transition-colors duration-300 ${!isSignUpActive ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-200'}`}
            >
              Log in
            </button>
            <button 
              onClick={() => {setIsSignUpActive(true); setCurrentStep(1);}} 
              className={`flex-1 py-3 md:py-4 text-center text-sm md:text-base font-medium cursor-pointer transition-colors duration-300 ${isSignUpActive ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-200'}`}
            >
              Sign up
            </button>
          </div>

          <div className="py-4 md:py-6">
            {/* Sign Up Form */}
            {isSignUpActive ? (
              <>
                <h2 className="text-lg md:text-xl lg:text-2xl font-[500] text-white mb-4">Sign up</h2>

                {/* Progress Bar */}
                {/* <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Step {currentStep} of 3</span>
                    <span className="text-xs text-gray-400">{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-theme_color h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div> */}

                {/* Step Indicator */}
                {/* <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${currentStep >= 1 ? 'bg-theme_color text-white' : 'bg-gray-700 text-gray-400'}`}>1</div>
                    <span className={`text-xs ${currentStep >= 1 ? 'text-white' : 'text-gray-400'}`}>Contact</span>
                  </div>
                  <div className={`flex-1 h-0.5 mx-1 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${currentStep >= 2 ? 'bg-theme_color text-white' : 'bg-gray-700 text-gray-400'}`}>2</div>
                    <span className={`text-xs ${currentStep >= 2 ? 'text-white' : 'text-gray-400'}`}>Personal</span>
                  </div>
                  <div className={`flex-1 h-0.5 mx-1 ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${currentStep >= 3 ? 'bg-theme_color text-white' : 'bg-gray-700 text-gray-400'}`}>3</div>
                    <span className={`text-xs ${currentStep >= 3 ? 'text-white' : 'text-gray-400'}`}>Password</span>
                  </div>
                </div> */}

                {/* Step 1: Contact Information */}
                {currentStep === 1 && (
                  <form onSubmit={handleSignUpStep1}>
                    {/* Currency Dropdown */}
                    <div className="mb-4">
                      <label htmlFor="currency" className="block text-xs md:text-sm text-gray-400 mb-2">Choose currency</label>
                      <div className="relative">
                        <select
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded appearance-none cursor-pointer outline-none"
                        >
                          <option value="BDT">BDT</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 md:px-3 text-gray-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707 5-5-1.414-1.414L10 10.828 6.414 7.242 5 8.656l4.293 4.293z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-xs md:text-sm text-gray-400 mb-2">Phone number</label>
                      <div className="flex items-stretch bg-gray-800 border border-gray-700 rounded">
                        {/* Country Code with Flag */}
                        <div className="flex items-center px-2 md:px-3 bg-gray-800 rounded-l border-r border-gray-700">
                          <img src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/flag-type/BD.png?v=1754999737902&source=drccdnsrc" alt="Bangladesh Flag" className="w-5 h-5 md:w-6 md:h-6 mr-1 md:mr-2 rounded-full" />
                          <span className="text-white text-sm md:text-base">+880</span>
                        </div>
                        
                        {/* Phone Number Input Field */}
                        <div className="flex items-center flex-grow pl-2 md:pl-3">
                          <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full py-2 md:py-3 bg-transparent text-white focus:outline-none placeholder-gray-500 text-sm md:text-base"
                            placeholder="--- --- ---"
                          />
                        </div>
                      </div>
                      {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>

                    {/* Referral Code Input */}
                    <div className="mb-4">
                      <label htmlFor="referralCode" className="block text-xs md:text-sm text-gray-400 mb-2">
                        Referral Code (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="referralCode"
                          value={referralCode}
                          onChange={(e) => {
                            setReferralCode(e.target.value.toUpperCase());
                            setReferralValid(false);
                            setReferrerInfo(null);
                          }}
                          className="flex-1 p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none"
                          placeholder="Enter referral code"
                          disabled={referralValid}
                        />
                        {!referralValid && (
                          <button
                            type="button"
                            onClick={checkReferralCode}
                            disabled={isCheckingReferral || !referralCode}
                            className="px-3 md:px-4 bg-theme_color text-white rounded text-sm font-medium disabled:opacity-50"
                          >
                            {isCheckingReferral ? 'Checking...' : 'Verify'}
                          </button>
                        )}
                        {referralValid && (
                          <button
                            type="button"
                            onClick={() => {
                              setReferralCode("");
                              setReferralValid(false);
                              setReferrerInfo(null);
                            }}
                            className="px-3 md:px-4 bg-red-600  text-white rounded text-sm font-[500]"
                          >
                            Change
                          </button>
                        )}
                      </div>
                      {referralError && <p className="text-red-500 text-xs mt-1">{referralError}</p>}
                      {referralValid && referrerInfo && (
                        <p className="text-green-500 text-xs mt-1">
                          Valid referral code from {referrerInfo.username}
                        </p>
                      )}
                    </div>

                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="w-full py-2 md:py-3 bg-theme_color  text-white cursor-pointer text-sm md:text-base font-[600] mt-4 shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Continue'}
                    </button>
                  </form>
                )}

                {/* Step 2: Personal Information */}
                {currentStep === 2 && (
                  <form onSubmit={handleSignUpStep2}>
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center cursor-pointer text-gray-400 mb-4 text-xs md:text-sm hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Back
                    </button>
                    
                    {/* Full Name Input */}
                    <div className="mb-4">
                      <label htmlFor="fullName" className="block text-xs md:text-sm text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none font-[400]"
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Email Input */}
                    {/* <div className="mb-4">
                      <label htmlFor="email" className="block text-xs md:text-sm text-gray-400 mb-2">Email (Optional)</label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none font-[400]"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div> */}
                    
                    {/* Username Input */}
                    <div className="mb-4">
                      <label htmlFor="username" className="block text-xs md:text-sm text-gray-400 mb-2">Username</label>
                      <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none font-[400]"
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                    </div>
                    
                    {/* Continue Button */}
                    <button
                      type="submit"
                      className="w-full py-2 md:py-3 bg-theme_color cursor-pointer text-white text-sm md:text-base font-[600] rounded mt-4 shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Continue'}
                    </button>
                  </form>
                )}

                {/* Step 3: Password Setup */}
                {currentStep === 3 && (
                  <form onSubmit={handleSignUpStep3}>
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center text-gray-400 mb-4 text-xs md:text-sm hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Back
                    </button>

                    {/* Password Input */}
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-xs md:text-sm text-gray-400 mb-2">Password</label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded outline-none font-[400]"
                        placeholder="Create a password"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-xs md:text-sm text-gray-400 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded outline-none font-[400]"
                        placeholder="Confirm your password"
                        disabled={isLoading}
                      />
                    </div>

                    {signupError && <p className="text-red-500 text-xs mt-1 mb-4">{signupError}</p>}

                    {/* Complete Sign Up Button */}
                    <button
                      type="submit"
                      className="w-full py-2 md:py-3 bg-theme_color cursor-pointer text-white text-sm md:text-base font-[600] mt-2 shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
                    </button>
                  </form>
                )}
              </>
            ) : (
              /* Login Form */
              <>
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-4 md:mb-6">Log in</h2>
                
                <form onSubmit={handleLoginSubmit}>
                  {/* Username Input */}
                  <div className="mb-4">
                    <label htmlFor="loginUsername" className="block text-xs md:text-sm text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      id="loginUsername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none"
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-4 md:mb-6">
                    <label htmlFor="loginPassword" className="block text-xs md:text-sm text-gray-400 mb-2">Password</label>
                    <input
                      type="password"
                      id="loginPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-800 border border-gray-700 text-white rounded focus:outline-none"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    {loginError && <p className="text-red-500 text-xs mt-1">{loginError}</p>}
                  </div>

                  {/* Remember me and Forgot password */}
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <label className="flex items-center text-xs md:text-sm text-gray-400">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-4 w-4 text-green-500 bg-gray-800 border-gray-700 rounded" 
                        disabled={isLoading}
                      />
                      <span className="ml-2">Remember me</span>
                    </label>
                    <NavLink to="/forgot-password" className="text-xs md:text-sm text-green-500 hover:underline">
                      Forgot password?
                    </NavLink>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full py-2 md:py-3 bg-theme_color cursor-pointer text-white text-sm md:text-base font-[600] rounded shadow-lg transition-transform transform hover:scale-[1.02] disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}