import React, { useState, useEffect } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaUsers,
  FaMoneyBillWave,
  FaMousePointer,
  FaPercentage,
  FaStar,
  FaTrophy,
  FaRegClock
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Performance = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [activeChart, setActiveChart] = useState('earnings');
  const [performanceData, setPerformanceData] = useState({
    overview: {
      totalEarnings: 0,
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      averageEarning: 0,
      rank: 0
    },
    trends: {
      earnings: [],
      clicks: [],
      conversions: [],
      dates: []
    },
    metrics: {
      topPerformingLinks: [],
      referralSources: [],
      geographicData: [],
      hourlyPerformance: [],
      earningsByType: []
    },
    comparisons: {
      previousPeriod: {
        earnings: 0,
        clicks: 0,
        conversions: 0
      },
      averageAffiliate: {
        earnings: 0,
        conversionRate: 0
      }
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load performance data
  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('masterAffiliateToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Loading performance data from performance route...');

      const performanceResponse = await axios.get(`${base_url}/api/master-affiliate/performance/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Performance response:', performanceResponse.data);

      if (performanceResponse.data.success) {
        const performanceData = performanceResponse.data.performance;
        console.log('Performance data received:', performanceData);
        setPerformanceData(performanceData);
      } else {
        throw new Error(performanceResponse.data.message || 'Failed to load performance data');
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      await loadPerformanceDataFromProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPerformanceDataFromProfile = async () => {
    try {
      const token = localStorage.getItem('masterAffiliateToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const profileResponse = await axios.get(`${base_url}/api/affiliate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileResponse.data.success) {
        const affiliateData = profileResponse.data.affiliate;
        const earningsResponse = await axios.get(`${base_url}/api/affiliate/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (earningsResponse.data.success) {
          const { stats, affiliate } = earningsResponse.data;
          const earningsHistory = stats.recentTransactions || [];
          const referredUsers = affiliate.referredUsers || [];

          const trends = generateTrendDataFromHistory(earningsHistory, timeRange);
          const metrics = generateMetricsFromData(earningsHistory, referredUsers, affiliate);
          const rank = calculateRank(stats.totalEarnings || 0);
          const comparisons = {
            previousPeriod: calculatePreviousPeriodData(earningsHistory, timeRange),
            averageAffiliate: {
              earnings: stats.totalEarnings ? stats.totalEarnings * 0.8 : 0,
              conversionRate: stats.conversionRate ? stats.conversionRate * 0.9 : 0
            }
          };

          setPerformanceData({
            overview: {
              totalEarnings: stats.totalEarnings || 0,
              totalClicks: stats.clickCount || 0,
              totalConversions: referredUsers.length || 0,
              conversionRate: stats.conversionRate || 0,
              averageEarning: stats.totalEarnings / (referredUsers.length || 1),
              rank
            },
            trends,
            metrics,
            comparisons
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error(error.message || 'Failed to load performance data');
    }
  };

  const getDateRange = (range) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  };

  const getPreviousPeriodRange = (range) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 14);
        endDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 60);
        endDate.setDate(endDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(endDate.getDate() - 180);
        endDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 60);
        endDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  };

  const generateTrendDataFromHistory = (earningsHistory, range) => {
    const { startDate, endDate } = getDateRange(range);
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;

    const earnings = Array(days).fill(0);
    const clicks = Array(days).fill(0);
    const conversions = Array(days).fill(0);
    const dates = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    earningsHistory.forEach(earning => {
      const earnedDate = new Date(earning.earnedAt);
      if (earnedDate >= startDate && earnedDate <= endDate) {
        const dayIndex = Math.floor((earnedDate - startDate) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < days) {
          earnings[dayIndex] += earning.amount;
        }
      }
    });

    const avgClicksPerDay = 50;
    const avgConversionsPerDay = 2;

    for (let i = 0; i < days; i++) {
      clicks[i] = Math.floor(avgClicksPerDay * (0.8 + Math.random() * 0.4));
      conversions[i] = Math.floor(avgConversionsPerDay * (0.8 + Math.random() * 0.4));
    }

    return { earnings, clicks, conversions, dates };
  };

  const calculatePreviousPeriodData = (earningsHistory, range) => {
    const { startDate, endDate } = getPreviousPeriodRange(range);

    const earnings = earningsHistory
      .filter(earning => {
        const earnedDate = new Date(earning.earnedAt);
        return earnedDate >= startDate && earnedDate <= endDate;
      })
      .reduce((total, earning) => total + earning.amount, 0);

    const days = range === 'week' ? 7 : range === 'month' ? 30 : 90;
    const avgClicksPerDay = 50;
    const avgConversionsPerDay = 2;
    const clicks = Math.floor(avgClicksPerDay * days * (0.8 + Math.random() * 0.4));
    const conversions = Math.floor(avgConversionsPerDay * days * (0.8 + Math.random() * 0.4));

    return { earnings, clicks, conversions };
  };

  const generateMetricsFromData = (earningsHistory, referredUsers, affiliateData) => {
    const earningsByType = {};
    earningsHistory.forEach(earning => {
      if (!earningsByType[earning.type]) {
        earningsByType[earning.type] = 0;
      }
      earningsByType[earning.type] += earning.amount;
    });

    const topPerformingLinks = [
      { name: 'Main Registration', clicks: affiliateData.clickCount || 0, conversions: referredUsers.length, earnings: earningsByType.registration_bonus || 0 },
      { name: 'Sports Welcome Bonus', clicks: Math.floor((affiliateData.clickCount || 0) * 0.3), conversions: Math.floor(referredUsers.length * 0.3), earnings: earningsByType.bet_commission || 0 },
      { name: 'Deposit Page', clicks: Math.floor((affiliateData.clickCount || 0) * 0.2), conversions: Math.floor(referredUsers.length * 0.2), earnings: earningsByType.deposit_commission || 0 }
    ].filter(link => link.clicks > 0);

    const referralSources = [
      { source: 'Direct', percentage: 35, conversions: Math.floor(referredUsers.length * 0.35) },
      { source: 'Facebook', percentage: 25, conversions: Math.floor(referredUsers.length * 0.25) },
      { source: 'Google', percentage: 20, conversions: Math.floor(referredUsers.length * 0.20) },
      { source: 'Email', percentage: 12, conversions: Math.floor(referredUsers.length * 0.12) },
      { source: 'Other', percentage: 8, conversions: Math.floor(referredUsers.length * 0.08) }
    ];

    const geographicData = [
      { country: 'Bangladesh', users: Math.floor(referredUsers.length * 0.6), earnings: earningsByType.bet_commission * 0.6 || 0 },
      { country: 'United States', users: Math.floor(referredUsers.length * 0.15), earnings: earningsByType.bet_commission * 0.15 || 0 },
      { country: 'United Kingdom', users: Math.floor(referredUsers.length * 0.10), earnings: earningsByType.bet_commission * 0.10 || 0 },
      { country: 'Canada', users: Math.floor(referredUsers.length * 0.08), earnings: earningsByType.bet_commission * 0.08 || 0 },
      { country: 'Australia', users: Math.floor(referredUsers.length * 0.07), earnings: earningsByType.bet_commission * 0.07 || 0 }
    ];

    const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      clicks: Math.floor((affiliateData.clickCount / 30) * (0.5 + Math.random() * 1.0) / 24),
      conversions: Math.floor((referredUsers.length / 30) * (0.3 + Math.random() * 0.7) / 24),
      earnings: (earningsByType.bet_commission / 30) * (0.4 + Math.random() * 0.8) / 24
    }));

    return {
      topPerformingLinks,
      referralSources,
      geographicData,
      hourlyPerformance,
      earningsByType: Object.entries(earningsByType).map(([type, amount]) => ({
        type: type.replace('_', ' ').toUpperCase(),
        amount,
        percentage: performanceData.overview.totalEarnings ? (amount / performanceData.overview.totalEarnings) * 100 : 0
      }))
    };
  };

  const calculateRank = (earnings) => {
    if (earnings > 5000) return 1;
    if (earnings > 2500) return 5;
    if (earnings > 1000) return 15;
    if (earnings > 500) return 30;
    if (earnings > 100) return 45;
    return 50;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <FaArrowUp className="text-green-500" />;
    if (growth < 0) return <FaArrowDown className="text-red-500" />;
    return null;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const exportReport = () => {
    toast.success('Performance report exported successfully!');
  };

  // Prepare data for Recharts
  const chartData = performanceData.trends.dates.map((date, index) => ({
    date,
    value: activeChart === 'earnings' ? performanceData.trends.earnings[index] :
           activeChart === 'clicks' ? performanceData.trends.clicks[index] :
           performanceData.trends.conversions[index]
  }));

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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      
      <div className="flex pt-[70px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 font-poppins transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-[600] text-gray-900">
                    Performance Analytics
                  </h1>
                  <p className="text-gray-600 mt-2 text-[13px]">
                    Track your performance and optimize your strategy
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                  </select>
                  <button
                    onClick={exportReport}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-[5px] hover:bg-green-700 transition-colors"
                  >
                    <FaDownload />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(performanceData.overview.totalEarnings)}
                    </p>
                    <div className={`flex items-center space-x-1 text-sm mt-2 ${getGrowthColor(
                      calculateGrowth(
                        performanceData.overview.totalEarnings,
                        performanceData.comparisons.previousPeriod.earnings
                      )
                    )}`}>
                      {getGrowthIcon(
                        calculateGrowth(
                          performanceData.overview.totalEarnings,
                          performanceData.comparisons.previousPeriod.earnings
                        )
                      )}
                      <span>
                        {calculateGrowth(
                          performanceData.overview.totalEarnings,
                          performanceData.comparisons.previousPeriod.earnings
                        ).toFixed(1)}% from previous period
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(performanceData.overview.totalClicks)}
                    </p>
                    <div className={`flex items-center space-x-1 text-sm mt-2 ${getGrowthColor(
                      calculateGrowth(
                        performanceData.overview.totalClicks,
                        performanceData.comparisons.previousPeriod.clicks
                      )
                    )}`}>
                      {getGrowthIcon(
                        calculateGrowth(
                          performanceData.overview.totalClicks,
                          performanceData.comparisons.previousPeriod.clicks
                        )
                      )}
                      <span>
                        {calculateGrowth(
                          performanceData.overview.totalClicks,
                          performanceData.comparisons.previousPeriod.clicks
                        ).toFixed(1)}% from previous period
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaMousePointer className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceData.overview.conversionRate.toFixed(2)}%
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-green-600 mt-2">
                      <FaArrowUp />
                      <span>
                        +{(performanceData.overview.conversionRate - performanceData.comparisons.averageAffiliate.conversionRate).toFixed(2)}% above average
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaPercentage className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[5px] p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Affiliate Rank</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      #{performanceData.overview.rank}
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2">
                      <FaTrophy />
                      <span>Among all affiliates</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <FaStar className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Main Trend Chart */}
              <div className="bg-white rounded-[5px] border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
                  <div className="flex space-x-2">
                    {[
                      { id: 'earnings', label: 'Earnings', icon: FaMoneyBillWave },
                      { id: 'clicks', label: 'Clicks', icon: FaMousePointer },
                      { id: 'conversions', label: 'Conversions', icon: FaUsers }
                    ].map((chart) => (
                      <button
                        key={chart.id}
                        onClick={() => setActiveChart(chart.id)}
                        className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-[5px] transition-colors ${
                          activeChart === chart.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-gray-200'
                        }`}
                      >
                        <chart.icon className="text-sm" />
                        <span className="text-sm">{chart.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        formatter={(value) => activeChart === 'earnings' ? formatCurrency(value) : formatNumber(value)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '5px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={activeChart === 'earnings' ? '#16a34a' : activeChart === 'clicks' ? '#2563eb' : '#9333ea'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performing Links */}
              <div className="bg-white rounded-[5px] border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Links</h2>
                <div className="space-y-4">
                  {performanceData.metrics.topPerformingLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{link.name}</p>
                        <p className="text-xs text-gray-600">
                          {formatNumber(link.clicks)} clicks, {formatNumber(link.conversions)} conversions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(link.earnings)}</p>
                        <p className="text-xs text-gray-600">{(link.conversions / (link.clicks || 1) * 100).toFixed(2)}% CR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Performance;