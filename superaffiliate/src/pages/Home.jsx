import React, { useState, useEffect } from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaUserPlus, 
  FaSignInAlt, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaUsers, 
  FaCreditCard, 
  FaHeadset, 
  FaRocket, 
  FaChevronDown, 
  FaChevronUp, 
  FaStar, 
  FaTools, 
  FaTrophy 
} from 'react-icons/fa';
import { FaShieldAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import axios from 'axios';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [affiliateDropdown, setAffiliateDropdown] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState('https://img.b112j.com/bj/h5/assets/v3/images/logo.png?v=1760527477748&source=drccdnsrc');
  const [footerLogo, setFooterLogo] = useState('https://bajiliveaffiliate.com/wp-content/uploads/2023/08/bjaff-logo2-e1708094785566.png');

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch branding data for dynamic logo
  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${base_url}/api/branding`);
      if (response.data.success && response.data.data && response.data.data.logo) {
        const logoUrl = response.data.data.logo.startsWith('http') 
          ? response.data.data.logo 
          : `${base_url}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
        setFooterLogo(logoUrl);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
      // Keep the default logos if there's an error
    }
  };

  useEffect(() => {
    fetchBrandingData();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Menu Items with dropdown support
  const menuItems = [
    { label: 'Home', href: '#home' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why Partner', href: '#why-partner' },
    { label: 'Commission', href: '#commission' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Tools', href: '#tools' },
    {
      label: 'Affiliate',
      dropdown: true,
      subItems: [
        { label: 'Super Affiliate', href: 'https://affiliate.1xwin.live/login' },
        { label: 'Master Affiliate', href: 'https://m-affiliate.1xwin.live/login' },
      ],
    },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const faqData = [
    {
      question: "How do I join the 1xwin Affiliate Program?",
      answer: "Click the 'Join Now' button, fill out the registration form, and our team will review your application within 24-48 hours."
    },
    {
      question: "What commission rates do you offer?",
      answer: "Our tiered commission rates start at 25% for new affiliates and go up to 35% for elite performers, with additional bonuses."
    },
    {
      question: "How often are payments made?",
      answer: "Payments are processed monthly via bank transfer, PayPal, or e-wallets, depending on your region."
    },
    {
      question: "What tracking system do you use?",
      answer: "We use advanced tracking with 24/7 monitoring to ensure all referrals are accurately credited."
    },
    {
      question: "Is there any cost to join?",
      answer: "No, joining is completely free with no hidden fees."
    },
    {
      question: "What marketing materials are provided?",
      answer: "We provide banners, text links, landing pages, and promotional content to maximize your earnings."
    }
  ];

  const testimonialData = [
    {
      name: "Sarah J.",
      role: "Elite Affiliate",
      quote: "1xwin's affiliate program has been a game-changer! The high commissions and real-time tracking make it easy to earn big.",
      image: "https://via.placeholder.com/100"
    },
    {
      name: "Michael T.",
      role: "Pro Affiliate",
      quote: "The support team is incredible, and the marketing tools provided helped me scale my earnings quickly!",
      image: "https://via.placeholder.com/100"
    },
    {
      name: "Priya R.",
      role: "Starter Affiliate",
      quote: "As a beginner, I found the program easy to join and the resources super helpful. Highly recommend!",
      image: "https://via.placeholder.com/100"
    }
  ];

  const successStories = [
    {
      title: "From Beginner to Elite in 6 Months",
      description: "John started with no experience and scaled to the Elite Tier, earning over $10,000 monthly with our tools and support.",
      icon: <FaTrophy className="text-3xl text-yellow-500" />
    },
    {
      title: "Global Reach, Local Impact",
      description: "Ayesha used our marketing materials to tap into international markets, earning consistent commissions across regions.",
      icon: <FaUsers className="text-3xl text-blue-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#141515] font-nunito text-gray-100">
      {/* ==================== HEADER ==================== */}
      <header className="bg-[#1a1b1b] sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src={dynamicLogo}
                alt="1xwin Affiliate"
                className="h-14 w-auto"
                onError={(e) => {
                  e.target.src = 'https://img.b112j.com/bj/h5/assets/v3/images/logo.png?v=1760527477748&source=drccdnsrc';
                }}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 items-center">
              {menuItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setAffiliateDropdown(true)}
                  onMouseLeave={() => item.dropdown && setAffiliateDropdown(false)}
                >
                  {item.dropdown ? (
                    <button
                      className="text-gray-300 hover:text-purple-500 font-semibold transition duration-300 flex items-center space-x-1"
                    >
                      <span>{item.label}</span>
                      <FaChevronDown
                        className={`text-xs transition-transform ${affiliateDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-purple-500 font-semibold transition duration-300"
                    >
                      {item.label}
                    </a>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && affiliateDropdown && (
                    <div className="absolute left-0 mt-1 w-48 bg-[#2a2b2b] rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                      {item.subItems?.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3b3b] hover:text-purple-400 transition"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Auth Buttons */}
              <NavLink to="/login" className="bg-[#2a2b2b] text-gray-300 px-5 py-2 rounded-[5px] font-[500] hover:bg-[#3a3b3b] transition duration-300 flex items-center space-x-2 border border-gray-700">
                <span>Login</span>
              </NavLink>
              <NavLink to="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-[5px] font-[500] hover:from-purple-700 hover:to-blue-700 transition duration-300 flex items-center space-x-2 shadow-lg">
                <span>Sign Up</span>
              </NavLink>
            </nav>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-gray-300 focus:outline-none cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:test-hidden mt-4 pb-4 bg-[#1a1b1b]">
              <div className="flex flex-col space-y-4 px-4">
                {menuItems.map((item, idx) => (
                  <div key={idx}>
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => setAffiliateDropdown(!affiliateDropdown)}
                          className="w-full text-left text-gray-300 hover:text-purple-500 font-semibold flex items-center justify-between"
                        >
                          {item.label}
                          <FaChevronDown
                            className={`transition-transform ${affiliateDropdown ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {affiliateDropdown && (
                          <div className="mt-2 ml-4 space-y-2">
                            {item.subItems?.map((sub, sIdx) => (
                              <a
                                key={sIdx}
                                href={sub.href}
                                className="block text-gray-400 hover:text-purple-400"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className="text-gray-300 hover:text-purple-500 font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}

                <div className="flex space-x-4 pt-2">
                  <NavLink to="/login" className="bg-[#2a2b2b] text-gray-300 px-5 py-2 rounded-lg font-semibold hover:bg-[#3a3b3b] transition duration-300 flex items-center space-x-2 flex-1 justify-center border border-gray-700">
                    <span>Login</span>
                  </NavLink>
                  <NavLink to="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 flex items-center space-x-2 flex-1 justify-center">
                    <span>Sign Up</span>
                  </NavLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ==================== BANNER SECTION ==================== */}
      <section id="home" className="relative h-[90vh] bg-[#141515] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#141515] via-transparent to-[#141515] z-10"></div>
        <div className="container mx-auto px-4 py-16 h-full relative z-20">
          <div className="grid lg:grid-cols-2 h-full gap-12 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500 leading-tight">
                Join 1xwin Affiliate Program
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
                Unlock unlimited earning potential by promoting 1xwin. Start today and turn your audience into profit!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <NavLink to="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 shadow-lg text-center">
                  Join Now - Start Earning
                </NavLink>
                <button className="bg-[#2a2b2b] text-gray-300 px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#3a3b3b] transition duration-300 border border-gray-700">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://bajiliveaffiliate.com/wp-content/uploads/2024/02/bjaff-banner.jpg"
                alt="1xwin Affiliate Program"
                className="w-full max-w-2xl h-auto rounded-[5px] border border-gray-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS SECTION ==================== */}
      <section id="how-it-works" className="py-20 bg-[#1a1b1b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start earning in just three simple steps. It's quick, easy, and rewarding!
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2a2b2b] p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-purple-500/30 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                <span className="text-3xl font-bold text-purple-500">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">Sign Up</h3>
              <p className="text-gray-400">Register with your details and get approved quickly to start your journey.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-blue-500/30 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <span className="text-3xl font-bold text-blue-500">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">Promote</h3>
              <p className="text-gray-400">Share your unique links and marketing materials to attract new users.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-green-500/30 hover:transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <span className="text-3xl font-bold text-green-500">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-4">Earn</h3>
              <p className="text-gray-400">Earn commissions for every referral and track your earnings in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHY PARTNER SECTION ==================== */}
      <section id="why-partner" className="py-20 bg-[#141515]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Why Partner with 1xwin?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover why thousands of affiliates choose 1xwin for unmatched earning potential.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-purple-500/30">
              <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <FaRocket className="text-2xl text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Proven Track Record</h3>
              <p className="text-gray-400">Join a trusted platform with a global network of successful affiliates.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-blue-500/30">
              <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <FaShieldAlt className="text-2xl text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Trust & Security</h3>
              <p className="text-gray-400">Secure payments and reliable tracking ensure your earnings are safe.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-green-500/30">
              <div className="w-16 h-16 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                <FaChartLine className="text-2xl text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Growth Opportunities</h3>
              <p className="text-gray-400">Scale your income with tiered commissions and performance bonuses.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-yellow-500/30">
              <div className="w-16 h-16 bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                <FaHeadset className="text-2xl text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">24/7 Support</h3>
              <p className="text-gray-400">Our dedicated team is always ready to help you succeed.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-red-500/30">
              <div className="w-16 h-16 bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                <FaUsers className="text-2xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Global Reach</h3>
              <p className="text-gray-400">Tap into international markets with our recognized brand.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-teal-500/30">
              <div className="w-16 h-16 bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/20">
                <FaCreditCard className="text-2xl text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Flexible Payments</h3>
              <p className="text-gray-400">Choose from multiple payment options for timely payouts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== COMMISSION STRUCTURE SECTION ==================== */}
      <section id="commission" className="py-20 bg-[#1a1b1b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Commission Structure</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Competitive rates and bonuses to maximize your earnings.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2a2b2b] shadow-lg p-8 text-center rounded-[5px] hover:transform hover:scale-105 transition duration-300 border border-purple-500/20">
              <div className="w-20 h-20 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                <FaMoneyBillWave className="text-3xl text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Starter Tier</h3>
              <p className="text-4xl font-bold text-purple-500 mb-4">25%</p>
              <p className="text-gray-400">Commission on first-time purchases.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 text-center rounded-[5px] hover:transform hover:scale-105 transition duration-300 border border-blue-500/20">
              <div className="w-20 h-20 bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <FaUsers className="text-3xl text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Pro Tier</h3>
              <p className="text-4xl font-bold text-blue-500 mb-4">30%</p>
              <p className="text-gray-400">For affiliates with 50+ referrals.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 text-center rounded-[5px] hover:transform hover:scale-105 transition duration-300 border border-green-500/20">
              <div className="w-20 h-20 bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <FaRocket className="text-3xl text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Elite Tier</h3>
              <p className="text-4xl font-bold text-green-500 mb-4">35%</p>
              <p className="text-gray-400">For top performers with 200+ referrals.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 text-center rounded-[5px] hover:transform hover:scale-105 transition duration-300 border border-yellow-500/20">
              <div className="w-20 h-20 bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                <FaChartLine className="text-3xl text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Performance Bonus</h3>
              <p className="text-4xl font-bold text-yellow-500 mb-4">$500+</p>
              <p className="text-gray-400">Monthly bonuses for top affiliates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUPER AFFILIATE SECTION ==================== */}
      <section id="super-affiliate" className="py-20 bg-[#1a1b1b]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">Super Affiliate Program</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Take your earnings to the next level with exclusive benefits, higher commissions, and priority support.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-purple-500/20">
              <h3 className="text-2xl font-bold text-purple-400 mb-3">40% Commission</h3>
              <p className="text-gray-300">Earn more per referral with enhanced rates.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-blue-500/20">
              <h3 className="text-2xl font-bold text-blue-400 mb-3">Dedicated Manager</h3>
              <p className="text-gray-300">Get 1-on-1 support from a senior affiliate manager.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-green-500/20">
              <h3 className="text-2xl font-bold text-green-400 mb-3">VIP Events</h3>
              <p className="text-gray-300">Invitations to exclusive affiliate summits and retreats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MASTER AFFILIATE SECTION ==================== */}
      <section id="master-affiliate" className="py-20 bg-[#141515]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">Master Affiliate Program</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            The pinnacle of affiliate success — unlimited earnings, global influence, and lifetime rewards.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-yellow-500/20">
              <h3 className="text-2xl font-bold text-yellow-400 mb-3">50% Revenue Share</h3>
              <p className="text-gray-300">Lifetime revenue share on all your referrals.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-red-500/20">
              <h3 className="text-2xl font-bold text-red-400 mb-3">Equity Options</h3>
              <p className="text-gray-300">Earn equity in 1xwin for top performers.</p>
            </div>
            <div className="bg-[#2a2b2b] p-8 rounded-lg border border-teal-500/20">
              <h3 className="text-2xl font-bold text-teal-400 mb-3">Global Recognition</h3>
              <p className="text-gray-300">Be featured as a top affiliate worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BENEFITS SECTION ==================== */}
      <section id="benefits" className="py-20 bg-[#141515]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Why Join Our Program?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlock a world of benefits designed to help you succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                <FaMoneyBillWave className="text-xl text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">High Commissions</h3>
                <p className="text-gray-400">Earn up to 35% on every sale with our tiered structure.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-blue-500/30 transition duration-300">
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <FaShieldAlt className="text-xl text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Reliable Tracking</h3>
                <p className="text-gray-400">Advanced tracking ensures every referral is credited.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-green-500/30 transition duration-300">
              <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                <FaCreditCard className="text-xl text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Timely Payouts</h3>
                <p className="text-gray-400">Reliable monthly payments via multiple methods.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-yellow-500/30 transition duration-300">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                <FaHeadset className="text-xl text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Dedicated Support</h3>
                <p className="text-gray-400">Our team is here to help you maximize earnings.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-red-500/30 transition duration-300">
              <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/20">
                <FaChartLine className="text-xl text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Real-time Analytics</h3>
                <p className="text-gray-400">Monitor performance with detailed reports.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-[#2a2b2b] p-6 rounded-[5px] border border-gray-800 hover:border-teal-500/30 transition duration-300">
              <div className="w-12 h-12 bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                <FaRocket className="text-xl text-teal-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Marketing Resources</h3>
                <p className="text-gray-400">Access banners, links, and content for effective promotion.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== AFFILIATE TOOLS SECTION ==================== */}
      <section id="tools" className="py-20 bg-[#1a1b1b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Affiliate Tools</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get access to powerful tools to boost your affiliate marketing success.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-blue-500/30 hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <FaTools className="text-2xl text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Custom Banners</h3>
              <p className="text-gray-400">High-quality banners tailored to your audience for maximum conversions.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-green-500/30 hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                <FaChartLine className="text-2xl text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Analytics Dashboard</h3>
              <p className="text-gray-400">Track clicks, conversions, and earnings with real-time insights.</p>
            </div>
            <div className="bg-[#2a2b2b] shadow-lg p-8 rounded-[5px] hover:shadow-2xl transition duration-300 border border-gray-800 hover:border-yellow-500/30 hover:transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
                <FaRocket className="text-2xl text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-3">Promotional Content</h3>
              <p className="text-gray-400">Ready-to-use content to engage your audience and drive traffic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SPECIAL BANNER SECTION ==================== */}
      <section className="py-20 bg-[#141515] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">Join the Ultimate Affiliate Experience</h2>
            <p className="text-xl text-gray-400 mb-8">
              Leverage cutting-edge technology and unmatched earning potential with 1xwin.
            </p>
            <NavLink to="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 shadow-lg inline-block">
              Start Earning Today
            </NavLink>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section id="faq" className="py-20 bg-[#1a1b1b]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get answers to common questions about our affiliate program.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {faqData.map((faq, index) => (
              <div key={index} className="mb-4 bg-[#2a2b2b] rounded-xl shadow-md overflow-hidden border border-gray-800 hover:border-purple-500/30 transition duration-300">
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-[#3a3b3b] transition duration-300"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-semibold text-gray-100">{faq.question}</span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-purple-500" />
                  ) : (
                    <FaChevronDown className="text-purple-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-5 bg-purple-900/20 border-t border-purple-500/20">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="contact" className="bg-[#141515] text-white border-t border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={footerLogo}
                  alt="1xwin Affiliate"
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.src = 'https://bajiliveaffiliate.com/wp-content/uploads/2023/08/bjaff-logo2-e1708094785566.png';
                  }}
                />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Join 1xwin Affiliate and turn your audience into income with our premium services and generous commissions.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="text-gray-400 hover:text-purple-500 transition duration-300">
                  <FaFacebook className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition duration-300">
                  <FaTwitter className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition duration-300">
                  <FaInstagram className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-500 transition duration-300">
                  <FaLinkedin className="text-2xl" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-100">Quick Links</h3>
              <ul className="space-y-3">
                {menuItems.filter(item => !item.dropdown).map((item, idx) => (
                  <li key={idx}>
                    <a href={item.href} className="text-gray-400 hover:text-purple-500 transition duration-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-100">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <FaEnvelope className="text-purple-500" />
                  <span className="text-gray-400">affiliate@1xwin.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaPhone className="text-purple-500" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-purple-500" />
                  <span className="text-gray-400">123 Business Ave, City</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 1xwin Affiliate Program. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-purple-500 text-sm transition duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-purple-500 text-sm transition duration-300">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-purple-500 text-sm transition duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;