import React, { useState, useEffect } from 'react';
import { 
  FaCopy, 
  FaShareAlt, 
  FaQrcode, 
  FaLink, 
  FaEye,
  FaChartLine,
  FaDownload,
  FaEdit,
  FaPlus,
  FaCode,
  FaPalette,
  FaMobile,
  FaDesktop,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope,
  FaTimes,
  FaUsers,
  FaMousePointer,
  FaCrown,
  FaCoins,
  FaRocket,
  FaUserPlus
} from 'react-icons/fa';
import { FaShieldAlt } from "react-icons/fa";
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Referlinks = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const website_url = 'http://localhost:5173'; // Your website URL
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('links');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const [showQRCode, setShowQRCode] = useState('');

  // Referral data state
  const [referralData, setReferralData] = useState({
    masterCode: '',
    customMasterCode: '',
    totalClicks: 0,
    totalSubAffiliates: 0,
    conversionRate: 0,
    referralLinks: [],
    creatives: [],
    performance: {}
  });

  // New link form state
  const [newLink, setNewLink] = useState({
    name: '',
    targetUrl: '',
    category: 'general',
    customPath: '',
    description: ''
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load referral data
  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');
      
      // Load master affiliate profile data
      const profileResponse = await axios.get(`${base_url}/api/master-affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const profile = profileResponse.data.affiliate;
        const masterCode = profile.masterCode || profile.customMasterCode;
        const totalSubAffiliates = profile.totalSubAffiliates || 0;
        const activeSubAffiliates = profile.activeSubAffiliates || 0;
        const conversionRate = profile.conversionRate || 0;

        // Generate master affiliate referral links with MASTER parameter (?master=)
        const mainRegistrationLink = `${website_url}/register?aff=${masterCode}`;
        const playerRegistrationLink = `${website_url}/register?master=${masterCode}`;
        const depositLink = `${website_url}/deposit?master=${masterCode}`;
        const sportsbookLink = `${website_url}/sports?master=${masterCode}`;
        const casinoLink = `${website_url}/casino?master=${masterCode}`;

        setReferralData({
          masterCode: masterCode,
          customMasterCode: profile.customMasterCode || masterCode,
          totalClicks: profile.totalReferrals || 0,
          totalSubAffiliates: totalSubAffiliates,
          conversionRate: conversionRate,
          referralLinks: [
            {
              id: 1,
              name: 'Master Affiliate Registration',
              url: mainRegistrationLink,
              clicks: totalSubAffiliates,
              conversions: activeSubAffiliates,
              createdAt: profile.createdAt || new Date(),
              isActive: true,
              category: 'master_registration',
              description: 'For new affiliates to join under your network',
              icon: FaCrown,
              color: 'from-purple-500 to-pink-500'
            },
          
          ],
          creatives: [
            {
              id: 1,
              name: 'Master Affiliate Banner',
              size: '728x90',
              code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/master-728x90.jpg" alt="Become a Master Affiliate" width="728" height="90" /></a>`,
              imageUrl: `${website_url}/banners/master-728x90.jpg`,
              type: 'master'
            },
            {
              id: 2,
              name: 'Square Master Banner',
              size: '300x250',
              code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/master-300x250.jpg" alt="Join Master Network" width="300" height="250" /></a>`,
              imageUrl: `${website_url}/banners/master-300x250.jpg`,
              type: 'master'
            },
            {
              id: 3,
              name: 'Player Registration Banner',
              size: '728x90',
              code: `<a href="${playerRegistrationLink}" target="_blank"><img src="${website_url}/banners/player-728x90.jpg" alt="Best Betting Platform" width="728" height="90" /></a>`,
              imageUrl: `${website_url}/banners/player-728x90.jpg`,
              type: 'player'
            },
            {
              id: 4,
              name: 'Text Link - Master',
              size: 'Text',
              code: `<a href="${mainRegistrationLink}" target="_blank" style="color: #8B5CF6; font-weight: bold; text-decoration: none;">✨ Join Our Master Affiliate Network - Earn Override Commissions! ✨</a>`,
              imageUrl: null,
              type: 'master'
            },
            {
              id: 5,
              name: 'Text Link - Player',
              size: 'Text',
              code: `<a href="${playerRegistrationLink}" target="_blank" style="color: #10B981; font-weight: bold; text-decoration: none;">🎯 Best Betting Platform - Register Now & Get Welcome Bonus! 🎯</a>`,
              imageUrl: null,
              type: 'player'
            }
          ],
          performance: {
            today: { 
              clicks: Math.floor(totalSubAffiliates * 0.04), 
              conversions: Math.floor(activeSubAffiliates * 0.03) 
            },
            week: { 
              clicks: Math.floor(totalSubAffiliates * 0.25), 
              conversions: Math.floor(activeSubAffiliates * 0.25) 
            },
            month: { 
              clicks: totalSubAffiliates, 
              conversions: activeSubAffiliates 
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      // If API fails, create demo data with your website URL
      createDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  // Create demo data if API fails
  const createDemoData = () => {
    const demoMasterCode = 'MAST7SP1E5'; // Master affiliate code
    
    // Use ?master= parameter for master affiliate links
    const mainRegistrationLink = `${website_url}/affiliate/register?master=${demoMasterCode}`;
    const playerRegistrationLink = `${website_url}/register?master=${demoMasterCode}`;
    const depositLink = `${website_url}/deposit?master=${demoMasterCode}`;
    const sportsbookLink = `${website_url}/sports?master=${demoMasterCode}`;
    const casinoLink = `${website_url}/casino?master=${demoMasterCode}`;

    setReferralData({
      masterCode: demoMasterCode,
      customMasterCode: demoMasterCode,
      totalClicks: 0,
      totalSubAffiliates: 0,
      conversionRate: 0,
      referralLinks: [
        {
          id: 1,
          name: 'Master Affiliate Registration',
          url: mainRegistrationLink,
          clicks: 0,
          conversions: 0,
          createdAt: new Date(),
          isActive: true,
          category: 'master_registration',
          description: 'For new affiliates to join under your network',
          icon: FaCrown,
          color: 'from-purple-500 to-pink-500'
        },
        {
          id: 2,
          name: 'Player Registration',
          url: playerRegistrationLink,
          clicks: 0,
          conversions: 0,
          createdAt: new Date(),
          isActive: true,
          category: 'player_registration',
          description: 'Direct player registration link',
          icon: FaUserPlus,
          color: 'from-blue-500 to-cyan-500'
        }
      ],
      creatives: [
        {
          id: 1,
          name: 'Master Affiliate Banner',
          size: '728x90',
          code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/master-728x90.jpg" alt="Become a Master Affiliate" width="728" height="90" /></a>`,
          imageUrl: `${website_url}/banners/master-728x90.jpg`,
          type: 'master'
        },
        {
          id: 2,
          name: 'Text Link - Master',
          size: 'Text',
          code: `<a href="${mainRegistrationLink}" target="_blank" style="color: #8B5CF6; font-weight: bold; text-decoration: none;">✨ Join Our Master Affiliate Network - Earn Override Commissions! ✨</a>`,
          imageUrl: null,
          type: 'master'
        }
      ],
      performance: {
        today: { clicks: 0, conversions: 0 },
        week: { clicks: 0, conversions: 0 },
        month: { clicks: 0, conversions: 0 }
      }
    });
  };

  // Track click function
  const trackClick = async (linkId, linkUrl) => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      
      // Call the track-click API endpoint
      await axios.post(`${base_url}/api/master-affiliate/track-click`, {
        masterCode: referralData.masterCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state to reflect the click
      setReferralData(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        referralLinks: prev.referralLinks.map(link => 
          link.id === linkId 
            ? { ...link, clicks: link.clicks + 1 }
            : link
        ),
        performance: {
          ...prev.performance,
          today: {
            ...prev.performance.today,
            clicks: prev.performance.today.clicks + 1
          },
          week: {
            ...prev.performance.week,
            clicks: prev.performance.week.clicks + 1
          },
          month: {
            ...prev.performance.month,
            clicks: prev.performance.month.clicks + 1
          }
        }
      }));

      // Open the link in new tab after tracking
      window.open(linkUrl, '_blank');
      
    } catch (error) {
      console.error('Error tracking click:', error);
      // If tracking fails, still open the link
      window.open(linkUrl, '_blank');
    }
  };

  const copyToClipboard = (text, name = 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(text);
      toast.success(`${name} copied to clipboard!`);
      setTimeout(() => setCopiedLink(''), 2000);
    });
  };

  const generateQRCode = (url) => {
    setShowQRCode(url);
  };

  const createCustomLink = async () => {
    try {
      if (!newLink.name || !newLink.targetUrl) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Generate the custom URL with MASTER parameter (?master=)
      const customPath = newLink.customPath || newLink.name.toLowerCase().replace(/\s+/g, '-');
      const customUrl = `${website_url}/${customPath}?master=${referralData.masterCode}`;

      const newReferralLink = {
        id: Date.now(),
        name: newLink.name,
        url: customUrl,
        clicks: 0,
        conversions: 0,
        createdAt: new Date(),
        isActive: true,
        category: newLink.category,
        description: newLink.description,
        icon: FaLink,
        color: 'from-gray-500 to-gray-600'
      };

      setReferralData(prev => ({
        ...prev,
        referralLinks: [newReferralLink, ...prev.referralLinks]
      }));

      setShowCreateModal(false);
      setNewLink({
        name: '',
        targetUrl: '',
        category: 'general',
        customPath: '',
        description: ''
      });

      toast.success('Custom master link created successfully!');
    } catch (error) {
      console.error('Error creating custom link:', error);
      toast.error('Failed to create custom link');
    }
  };

  const shareOnSocialMedia = (platform, url, text = 'Join our Master Affiliate Network! Earn override commissions and build your own team. Limited spots available!') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=Join Our Master Affiliate Network&body=${encodedText}%0A%0A${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: FaFacebook,
      twitter: FaTwitter,
      whatsapp: FaWhatsapp,
      telegram: FaTelegram,
      email: FaEnvelope
    };
    const IconComponent = icons[platform];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <FaShareAlt className="w-4 h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      master_registration: 'bg-purple-100 text-purple-800',
      player_registration: 'bg-blue-100 text-blue-800',
      deposit: 'bg-green-100 text-green-800',
      sports: 'bg-orange-100 text-orange-800',
      casino: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const getCategoryName = (category) => {
    const names = {
      master_registration: 'Master Registration',
      player_registration: 'Player Registration',
      deposit: 'Deposit',
      sports: 'Sportsbook',
      casino: 'Casino',
      general: 'General'
    };
    return names[category] || category;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-16">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`flex-1 p-8 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Master Referral Links
                  </h1>
                  <p className="text-gray-600 mt-2 text-sm flex items-center">
                    <FaCrown className="text-amber-500 mr-2" />
                    Share your master affiliate links and build your network
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Total Clicks</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatNumber(referralData.totalClicks)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaMousePointer className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Sub-Affiliates</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatNumber(referralData.totalSubAffiliates)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaUsers className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold mt-1">
                      {referralData.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[5px] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Master Code</p>
                    <p className="text-2xl font-bold mt-1 font-mono">
                      {referralData.masterCode}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FaCrown className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-[5px]  border border-gray-100 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'links', label: 'Master Links', icon: FaLink },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 cursor-pointer px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600 font-semibold'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`text-lg ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Master Links Tab */}
                {activeTab === 'links' && (
                  <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Your Master Affiliate Links</h2>
                      <p className="text-gray-600 text-sm mt-1 lg:mt-0">
                        Share these links to grow your affiliate network
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {referralData.referralLinks.map((link) => {
                        const IconComponent = link.icon;
                        return (
                          <div key={link.id} className={`bg-blue-600 rounded-[5px] p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                  <IconComponent className="text-xl text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-white text-lg">{link.name}</h3>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mt-1">
                                    {getCategoryName(link.category)}
                                  </span>
                                </div>
                              </div>
                              {link.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                                  Active
                                </span>
                              )}
                            </div>
                            
                            <p className="text-white/80 text-sm mb-4">{link.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
                              <span>Clicks: <strong className="text-white">{formatNumber(link.clicks)}</strong></span>
                              <span>Conversions: <strong className="text-white">{formatNumber(link.conversions)}</strong></span>
                            </div>

                            <div className="space-y-3">
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={link.url}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-white/30 rounded-lg bg-white/10 text-white text-sm font-mono placeholder-white/50 backdrop-blur-sm"
                                />
                                <button
                                  onClick={() => copyToClipboard(link.url, link.name)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    copiedLink === link.url 
                                      ? 'bg-white text-purple-600' 
                                      : 'bg-white/20 text-white hover:bg-white/30'
                                  }`}
                                >
                                  <FaCopy className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Click Tracking Button */}
                              <button
                                onClick={() => trackClick(link.id, link.url)}
                                className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                              >
                                <FaMousePointer className="w-4 h-4" />
                                <span>Click to Open & Track</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Modal */}
            {showQRCode && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                    <button
                      onClick={() => setShowQRCode('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-white text-sm font-medium">Master QR Code</span>
                      </div>
                      <p className="text-sm text-gray-600">Scan to visit master link</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(showQRCode, 'URL')}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => setShowQRCode('')}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Custom Link Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Create Custom Master Link</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Name *
                      </label>
                      <input
                        type="text"
                        value={newLink.name}
                        onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., VIP Master Registration"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Path *
                      </label>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">{website_url}/</span>
                        <input
                          type="text"
                          value={newLink.targetUrl}
                          onChange={(e) => setNewLink(prev => ({ ...prev, targetUrl: e.target.value }))}
                          placeholder="vip-master"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Final URL: {website_url}/{newLink.targetUrl || 'your-path'}?master={referralData.masterCode}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newLink.category}
                        onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      >
                        <option value="general">General</option>
                        <option value="master_registration">Master Registration</option>
                        <option value="player_registration">Player Registration</option>
                        <option value="deposit">Deposit</option>
                        <option value="sports">Sportsbook</option>
                        <option value="casino">Casino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newLink.description}
                        onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this master link..."
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={createCustomLink}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold"
                    >
                      Create Master Link
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Referlinks;