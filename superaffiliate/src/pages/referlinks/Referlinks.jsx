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
  FaMousePointer
} from 'react-icons/fa';
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
    affiliateCode: '',
    customCode: '',
    totalClicks: 0,
    totalConversions: 0,
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
      const token = localStorage.getItem('affiliatetoken');
      
      // Load affiliate profile data
      const profileResponse = await axios.get(`${base_url}/api/affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const profile = profileResponse.data.affiliate;
        const affiliateCode = profile.affiliateCode;
        const clickCount = profile.clickCount || 0;
        const referralCount = profile.referralCount || 0;
        const conversionRate = profile.conversionRate || 0;

        // Generate referral links with AFFILIATE parameter (?aff=)
        const mainRegistrationLink = `${website_url}/register?aff=${affiliateCode}`;
        const depositLink = `${website_url}/deposit?aff=${affiliateCode}`;
        const sportsbookLink = `${website_url}/sports?aff=${affiliateCode}`;
        const casinoLink = `${website_url}/casino?aff=${affiliateCode}`;

        setReferralData({
          affiliateCode: affiliateCode,
          customCode: profile.customAffiliateCode || affiliateCode,
          totalClicks: clickCount,
          totalConversions: referralCount,
          conversionRate: conversionRate,
          referralLinks: [
            {
              id: 1,
              name: 'Main Registration',
              url: mainRegistrationLink,
              clicks: clickCount,
              conversions: referralCount,
              createdAt: profile.createdAt || new Date(),
              isActive: true,
              category: 'registration',
              description: 'Main registration page for new users'
            },
          ],
          creatives: [
            {
              id: 1,
              name: 'Leaderboard Banner',
              size: '728x90',
              code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/728x90-banner.jpg" alt="Join Now" width="728" height="90" /></a>`,
              imageUrl: `${website_url}/banners/728x90-banner.jpg`
            },
            {
              id: 2,
              name: 'Square Banner',
              size: '300x250',
              code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/300x250-banner.jpg" alt="Best Betting Platform" width="300" height="250" /></a>`,
              imageUrl: `${website_url}/banners/300x250-banner.jpg`
            },
            {
              id: 3,
              name: 'Mobile Banner',
              size: '320x50',
              code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/320x50-banner.jpg" alt="Mobile Betting" width="320" height="50" /></a>`,
              imageUrl: `${website_url}/banners/320x50-banner.jpg`
            },
            {
              id: 4,
              name: 'Text Link',
              size: 'Text',
              code: `<a href="${mainRegistrationLink}" target="_blank" style="color: #10B981; font-weight: bold; text-decoration: none;">Join the Best Betting Platform - Get Welcome Bonus!</a>`,
              imageUrl: null
            },
            {
              id: 5,
              name: 'Sports Text Link',
              size: 'Text',
              code: `<a href="${sportsbookLink}" target="_blank" style="color: #10B981; font-weight: bold; text-decoration: none;">Live Sports Betting - Best Odds Available!</a>`,
              imageUrl: null
            }
          ],
          performance: {
            today: { 
              clicks: Math.floor(clickCount * 0.04), 
              conversions: Math.floor(referralCount * 0.03) 
            },
            week: { 
              clicks: Math.floor(clickCount * 0.25), 
              conversions: Math.floor(referralCount * 0.25) 
            },
            month: { 
              clicks: clickCount, 
              conversions: referralCount 
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
    const demoAffiliateCode = '7SP1E5FK'; // Using the code from your data
    
    // Use ?aff= parameter for affiliate links
    const mainRegistrationLink = `${website_url}/register?aff=${demoAffiliateCode}`;
    const depositLink = `${website_url}/deposit?aff=${demoAffiliateCode}`;
    const sportsbookLink = `${website_url}/sports?aff=${demoAffiliateCode}`;
    const casinoLink = `${website_url}/casino?aff=${demoAffiliateCode}`;

    setReferralData({
      affiliateCode: demoAffiliateCode,
      customCode: demoAffiliateCode,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      referralLinks: [
        {
          id: 1,
          name: 'Main Registration',
          url: mainRegistrationLink,
          clicks: 0,
          conversions: 0,
          createdAt: new Date(),
          isActive: true,
          category: 'registration',
          description: 'Main registration page for new users'
        },
      ],
      creatives: [
        {
          id: 1,
          name: 'Leaderboard Banner',
          size: '728x90',
          code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/728x90-banner.jpg" alt="Join Now" width="728" height="90" /></a>`,
          imageUrl: `${website_url}/banners/728x90-banner.jpg`
        },
        {
          id: 2,
          name: 'Square Banner',
          size: '300x250',
          code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/300x250-banner.jpg" alt="Best Betting Platform" width="300" height="250" /></a>`,
          imageUrl: `${website_url}/banners/300x250-banner.jpg`
        },
        {
          id: 3,
          name: 'Mobile Banner',
          size: '320x50',
          code: `<a href="${mainRegistrationLink}" target="_blank"><img src="${website_url}/banners/320x50-banner.jpg" alt="Mobile Betting" width="320" height="50" /></a>`,
          imageUrl: `${website_url}/banners/320x50-banner.jpg`
        },
        {
          id: 4,
          name: 'Text Link',
          size: 'Text',
          code: `<a href="${mainRegistrationLink}" target="_blank" style="color: #10B981; font-weight: bold; text-decoration: none;">Join the Best Betting Platform - Get Welcome Bonus!</a>`,
          imageUrl: null
        }
      ],
      performance: {
        today: { clicks: 0, conversions: 0 },
        week: { clicks: 0, conversions: 0 },
        month: { clicks: 0, conversions: 0 }
      }
    });
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

      // Generate the custom URL with AFFILIATE parameter (?aff=)
      const customPath = newLink.customPath || newLink.name.toLowerCase().replace(/\s+/g, '-');
      const customUrl = `${website_url}/${customPath}?aff=${referralData.affiliateCode}`;

      const newReferralLink = {
        id: Date.now(),
        name: newLink.name,
        url: customUrl,
        clicks: 0,
        conversions: 0,
        createdAt: new Date(),
        isActive: true,
        category: newLink.category,
        description: newLink.description
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

      toast.success('Custom link created successfully!');
    } catch (error) {
      console.error('Error creating custom link:', error);
      toast.error('Failed to create custom link');
    }
  };

  const shareOnSocialMedia = (platform, url, text = 'Check out this amazing betting platform! Join now and get exclusive bonuses!') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=Amazing Betting Platform&body=${encodedText}%0A%0A${encodedUrl}`
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
      registration: 'bg-blue-100 text-blue-800',
      deposit: 'bg-green-100 text-green-800',
      sports: 'bg-orange-100 text-orange-800',
      casino: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
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
    <div className="min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex pt-[80px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900">
                    Affiliate Links & Creatives
                  </h1>
                  <p className="text-gray-600 mt-2 text-[13px]">
                    Share your affiliate links and track their performance
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(referralData.totalClicks)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <FaMousePointer className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(referralData.totalConversions)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <FaUsers className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {referralData.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <FaChartLine className="text-white text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Affiliate Code</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                      {referralData.affiliateCode}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <FaCode className="text-white text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-[5px] border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {[
                    { id: 'links', label: 'Affiliate Links', icon: FaLink },
                    { id: 'performance', label: 'Performance Analytics', icon: FaChartLine },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 cursor-pointer px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`text-lg ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Affiliate Links Tab */}
                {activeTab === 'links' && (
                  <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <h2 className="text-xl font-[600] text-gray-900">Your Affiliate Links</h2>
                    </div>

                    <div className="space-y-4">
                      {referralData.referralLinks.map((link) => (
                        <div key={link.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{link.name}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(link.category)}`}>
                                  {link.category}
                                </span>
                                {link.isActive && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{link.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Clicks: <strong>{formatNumber(link.clicks)}</strong></span>
                                <span>Conversions: <strong>{formatNumber(link.conversions)}</strong></span>
                                <span>Created: <strong>{new Date(link.createdAt).toLocaleDateString()}</strong></span>
                              </div>
                              <div className="mt-3 flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={link.url}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono"
                                />
                                <button
                                  onClick={() => copyToClipboard(link.url, link.name)}
                                  className={`p-2 rounded-[5px] transition-colors  ${
                                    copiedLink === link.url 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-200 text-gray-700 border-[1px] border-gray-200 hover:bg-gray-300'
                                  }`}
                                >
                                  <FaCopy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marketing Creatives Tab */}
                {activeTab === 'creatives' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-[600] text-gray-900">Marketing Creatives</h2>
                      <p className="text-gray-600 mt-1 text-sm">Use these banners and text links on your website</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {referralData.creatives.map((creative, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">
                              {creative.name}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {creative.imageUrl ? 'Banner' : 'Text Link'}
                            </span>
                          </div>
                          
                          {creative.imageUrl && (
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-300">
                              <div className={`bg-gray-200 flex items-center justify-center ${
                                creative.size === '728x90' ? 'h-20' : 
                                creative.size === '300x250' ? 'h-48' : 'h-10'
                              }`}>
                                <span className="text-gray-500 text-sm">Banner Preview: {creative.size}</span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                HTML Code
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={creative.code}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono"
                                />
                                <button
                                  onClick={() => copyToClipboard(creative.code, 'HTML code')}
                                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                  <FaCopy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {creative.imageUrl && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Image URL
                                </label>
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={creative.imageUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono"
                                  />
                                  <button
                                    onClick={() => copyToClipboard(creative.imageUrl, 'image URL')}
                                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <FaCopy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Analytics Tab */}
                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-[600] text-gray-900">Performance Analytics</h2>
                      <p className="text-gray-600 mt-1 text-sm">Track how your affiliate links are performing</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Today</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Clicks:</span>
                            <span className="font-semibold">{referralData.performance.today.clicks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conversions:</span>
                            <span className="font-semibold">{referralData.performance.today.conversions}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Clicks:</span>
                            <span className="font-semibold">{referralData.performance.week.clicks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conversions:</span>
                            <span className="font-semibold">{referralData.performance.week.conversions}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Clicks:</span>
                            <span className="font-semibold">{referralData.performance.month.clicks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Conversions:</span>
                            <span className="font-semibold">{referralData.performance.month.conversions}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Link Performance</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 font-medium text-gray-700">Link Name</th>
                              <th className="text-left py-3 font-medium text-gray-700">Clicks</th>
                              <th className="text-left py-3 font-medium text-gray-700">Conversions</th>
                              <th className="text-left py-3 font-medium text-gray-700">Conversion Rate</th>
                              <th className="text-left py-3 font-medium text-gray-700">Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referralData.referralLinks.map((link) => (
                              <tr key={link.id} className="border-b border-gray-100">
                                <td className="py-3 text-gray-900">{link.name}</td>
                                <td className="py-3 text-gray-600">{formatNumber(link.clicks)}</td>
                                <td className="py-3 text-gray-600">{formatNumber(link.conversions)}</td>
                                <td className="py-3 text-gray-600">
                                  {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : 0}%
                                </td>
                                <td className="py-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ width: `${Math.min((link.conversions / Math.max(link.clicks, 1)) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                      <div className="w-48 h-48 bg-white border-4 border-gray-300 flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">QR Code would appear here</span>
                      </div>
                      <p className="text-sm text-gray-600">Scan to visit link</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(showQRCode, 'URL')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
                    <h3 className="text-xl font-semibold text-gray-900">Create Custom Affiliate Link</h3>
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
                        placeholder="e.g., Sports Welcome Bonus"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          placeholder="sports-welcome"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Final URL: {website_url}/{newLink.targetUrl || 'your-path'}?aff={referralData.affiliateCode}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newLink.category}
                        onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="registration">Registration</option>
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
                        placeholder="Brief description of this link..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={createCustomLink}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                    >
                      Create Link
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
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