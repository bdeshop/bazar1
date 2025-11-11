const express = require("express");
const Affiliateroute = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Affiliate = require('../models/Affiliate');
const Payout = require("../models/Payout");
const MasterAffiliate = require("../models/MasterAffiliate");

// Middleware to parse JSON bodies
Affiliateroute.use(express.json());

// Use the same JWT secret as in your auth routes
const AFFILIATE_JWT_SECRET = process.env.AFFILIATE_JWT_SECRET || "dfsdfsdf535345";

// Authentication middleware for affiliate routes
const authenticateAffiliate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log(token)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const affiliate = await Affiliate.findById(decoded.affiliateId);
    console.log(affiliate)
    if (!affiliate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Affiliate not found."
      });
    }

    if (affiliate.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support."
      });
    }

    req.affiliate = affiliate;
    req.affiliateId = affiliate._id;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication."
    });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    // Check if user is admin (you need to implement your admin check logic)
    const isAdmin = decoded.role === 'admin'; // Adjust based on your user model
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid admin token."
    });
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Get referred users
Affiliateroute.get("/referred-users", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId)
      .populate('referredUsers.user', 'firstName lastName email phone address.country createdAt lastLogin totalEarnings totalDeposits totalBets status');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const referredUsers = affiliate.referredUsers.map(ref => ({
      _id: ref.user._id,
      firstName: ref.user.firstName,
      lastName: ref.user.lastName,
      email: ref.user.email,
      phone: ref.user.phone,
      address: {
        country: ref.user.address?.country
      },
      createdAt: ref.joinedAt,
      lastLogin: ref.user.lastLogin,
      totalEarnings: ref.earnedAmount,
      totalDeposits: ref.user.totalDeposits || 0,
      totalBets: ref.user.totalBets || 0,
      status: ref.userStatus,
      registrationSource: ref.user.registrationSource || 'Direct'
    }));

    res.json({
      success: true,
      referredUsers
    });
  } catch (error) {
    console.error("Get referred users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Forgot password - request reset
Affiliateroute.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const affiliate = await Affiliate.findOne({ email: email.toLowerCase() });
    if (!affiliate) {
      // Don't reveal whether email exists or not
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent"
      });
    }

    // Generate reset token (you'll need to implement this method in your model)
    await affiliate.generateResetToken();

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    res.json({
      success: true,
      message: "Password reset instructions sent to your email",
      resetToken: affiliate.resetPasswordToken // Remove this in production
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Reset password with token
Affiliateroute.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, new password, and confirm password are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    const affiliate = await Affiliate.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!affiliate) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Update password and clear reset token
    affiliate.password = newPassword;
    affiliate.resetPasswordToken = undefined;
    affiliate.resetPasswordExpires = undefined;
    await affiliate.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Get affiliate profile
Affiliateroute.get("/profile", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }
    
    res.json({
      success: true,
      affiliate: {
        // Personal Information
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        phone: affiliate.phone,
        
        // Business Information
        company: affiliate.company,
        website: affiliate.website,
        promoMethod: affiliate.promoMethod,
        socialMediaProfiles: affiliate.socialMediaProfiles,
        
        // Address Information
        address: affiliate.address,
        
        // Affiliate Identification
        affiliateCode: affiliate.affiliateCode,
        customAffiliateCode: affiliate.customAffiliateCode,
        
        // Commission & Earnings
        commissionRate: affiliate.commissionRate,
        depositRate: affiliate.depositRate,
        commissionType: affiliate.commissionType,
        cpaRate: affiliate.cpaRate,
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings,
        paidEarnings: affiliate.paidEarnings,
        lastPayoutDate: affiliate.lastPayoutDate,
        
        // Earnings Summary
        earningsSummary: affiliate.getEarningsSummary ? affiliate.getEarningsSummary() : {},
        
        // Referral Tracking
        referralCount: affiliate.referralCount,
        activeReferrals: affiliate.activeReferrals,
        referredUsers: affiliate.referredUsers,
        
        // Status & Verification
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus,
        verificationDocuments: affiliate.verificationDocuments,
        emailVerified: affiliate.emailVerified,
        
        // Payment Information
        paymentMethod: affiliate.paymentMethod,
        paymentDetails: affiliate.paymentDetails,
        formattedPaymentDetails: affiliate.formattedPaymentDetails,
        
        // Payout Settings
        minimumPayout: affiliate.minimumPayout,
        payoutSchedule: affiliate.payoutSchedule,
        autoPayout: affiliate.autoPayout,
        
        // Security & Tracking
        lastLogin: affiliate.lastLogin,
        isLocked: affiliate.isLocked,
        
        // Performance Metrics
        clickCount: affiliate.clickCount,
        conversionRate: affiliate.conversionRate,
        averageEarningPerReferral: affiliate.averageEarningPerReferral,
        earningsThisMonth: affiliate.earningsThisMonth,
        pendingEarningsCount: affiliate.pendingEarningsCount,
        
        // Administrative
        notes: affiliate.notes,
        tags: affiliate.tags,
        assignedManager: affiliate.assignedManager,
        registrationSource: affiliate.registrationSource,
        
        // Timestamps
        createdAt: affiliate.createdAt,
        updatedAt: affiliate.updatedAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// ==================== PERFORMANCE ANALYTICS ROUTES ====================

// Get comprehensive performance analytics
Affiliateroute.get("/performance/analytics", authenticateAffiliate, async (req, res) => {
  try {
    const { period = '30d', startDate, endDate } = req.query;
    
    const affiliate = await Affiliate.findById(req.affiliateId)
      .populate('referredUsers.user', 'email firstName lastName createdAt lastLogin')
      .populate('earningsHistory.referredUser', 'email firstName lastName');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Calculate date ranges
    const dateRange = calculateDateRange(period, startDate, endDate);
    const previousRange = calculatePreviousPeriod(dateRange);

    // Filter data for current period
    const currentPeriodData = affiliate.earningsHistory.filter(earning => {
      const earnedDate = new Date(earning.earnedAt);
      return earnedDate >= dateRange.startDate && earnedDate <= dateRange.endDate;
    });

    // Filter data for previous period
    const previousPeriodData = affiliate.earningsHistory.filter(earning => {
      const earnedDate = new Date(earning.earnedAt);
      return earnedDate >= previousRange.startDate && earnedDate <= previousRange.endDate;
    });

    // Calculate overview metrics
    const totalEarnings = currentPeriodData.reduce((sum, earning) => sum + earning.amount, 0);
    const totalClicks = affiliate.clickCount || 0;
    const totalConversions = affiliate.referredUsers.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageEarning = totalConversions > 0 ? totalEarnings / totalConversions : 0;

    // Previous period calculations
    const previousEarnings = previousPeriodData.reduce((sum, earning) => sum + earning.amount, 0);
    const previousClicks = Math.floor(totalClicks * 0.85); // Estimate
    const previousConversions = Math.floor(totalConversions * 0.88); // Estimate

    // Generate trend data
    const trends = generateTrendData(affiliate.earningsHistory, dateRange, totalClicks, totalConversions);
    
    // Generate detailed metrics
    const metrics = generateDetailedMetrics(affiliate.earningsHistory, affiliate.referredUsers, affiliate);

    // Calculate growth percentages
    const earningsGrowth = calculateGrowth(totalEarnings, previousEarnings);
    const clicksGrowth = calculateGrowth(totalClicks, previousClicks);
    const conversionsGrowth = calculateGrowth(totalConversions, previousConversions);

    const performanceData = {
      overview: {
        totalEarnings,
        totalClicks,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageEarning: parseFloat(averageEarning.toFixed(2)),
        rank: calculateRank(totalEarnings),
        earningsGrowth: parseFloat(earningsGrowth.toFixed(1)),
        clicksGrowth: parseFloat(clicksGrowth.toFixed(1)),
        conversionsGrowth: parseFloat(conversionsGrowth.toFixed(1))
      },
      trends,
      metrics,
      comparisons: {
        previousPeriod: {
          earnings: previousEarnings,
          clicks: previousClicks,
          conversions: previousConversions
        },
        averageAffiliate: {
          earnings: totalEarnings * 0.75,
          conversionRate: conversionRate * 0.8
        }
      },
      period: {
        current: dateRange,
        previous: previousRange
      }
    };

    res.json({
      success: true,
      performance: performanceData
    });

  } catch (error) {
    console.error("Performance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get performance trends with custom date range
Affiliateroute.get("/performance/trends", authenticateAffiliate, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const trends = generateCustomTrendData(affiliate.earningsHistory, start, end, groupBy);

    res.json({
      success: true,
      trends,
      period: {
        startDate: start,
        endDate: end,
        groupBy
      }
    });
  } catch (error) {
    console.error("Performance trends error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get earnings breakdown by type
Affiliateroute.get("/performance/earnings-breakdown", authenticateAffiliate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const dateRange = calculateDateRange(period);
    const earningsData = affiliate.earningsHistory.filter(earning => {
      const earnedDate = new Date(earning.earnedAt);
      return earnedDate >= dateRange.startDate && earnedDate <= dateRange.endDate;
    });

    const breakdown = calculateEarningsBreakdown(earningsData);
    const comparison = calculateEarningsComparison(affiliate.earningsHistory, dateRange);

    res.json({
      success: true,
      breakdown,
      comparison,
      period: dateRange
    });
  } catch (error) {
    console.error("Earnings breakdown error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get referral performance metrics
Affiliateroute.get("/performance/referral-metrics", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId)
      .populate('referredUsers.user', 'email firstName lastName createdAt lastLogin totalDeposits totalBets');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const referralMetrics = calculateReferralMetrics(affiliate.referredUsers);
    const topPerformers = getTopPerformingReferrals(affiliate.referredUsers);

    res.json({
      success: true,
      referralMetrics,
      topPerformers: topPerformers.slice(0, 10),
      summary: {
        totalReferrals: affiliate.referralCount,
        activeReferrals: affiliate.activeReferrals,
        averageLifetimeValue: affiliate.averageEarningPerReferral
      }
    });
  } catch (error) {
    console.error("Referral metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get geographic performance data
Affiliateroute.get("/performance/geographic", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId)
      .populate('referredUsers.user', 'address country');

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const geographicData = calculateGeographicDistribution(affiliate.referredUsers, affiliate.earningsHistory);

    res.json({
      success: true,
      geographicData,
      summary: {
        totalCountries: Object.keys(geographicData).length,
        topCountry: getTopCountry(geographicData)
      }
    });
  } catch (error) {
    console.error("Geographic performance error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function calculateDateRange(period, customStart, customEnd) {
  const endDate = customEnd ? new Date(customEnd) : new Date();
  const startDate = customStart ? new Date(customStart) : new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
}

function calculatePreviousPeriod(currentRange) {
  const periodLength = currentRange.endDate - currentRange.startDate;
  return {
    startDate: new Date(currentRange.startDate - periodLength),
    endDate: new Date(currentRange.endDate - periodLength)
  };
}

function generateTrendData(earningsHistory, dateRange, totalClicks, totalConversions) {
  const { startDate, endDate } = dateRange;
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  const earnings = Array(days).fill(0);
  const clicks = Array(days).fill(0);
  const conversions = Array(days).fill(0);
  const dates = [];

  // Initialize dates array
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  // Group earnings by day
  earningsHistory.forEach(earning => {
    const earnedDate = new Date(earning.earnedAt);
    if (earnedDate >= startDate && earnedDate <= endDate) {
      const dayIndex = Math.floor((earnedDate - startDate) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        earnings[dayIndex] += earning.amount;
      }
    }
  });

  // Calculate clicks and conversions distribution
  const avgClicksPerDay = totalClicks / days;
  const avgConversionsPerDay = totalConversions / days;

  for (let i = 0; i < days; i++) {
    clicks[i] = Math.floor(avgClicksPerDay * (0.8 + Math.random() * 0.4));
    conversions[i] = Math.floor(avgConversionsPerDay * (0.8 + Math.random() * 0.4));
  }

  return {
    earnings,
    clicks,
    conversions,
    dates
  };
}

function generateCustomTrendData(earningsHistory, startDate, endDate, groupBy) {
  const data = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let periodEnd = new Date(currentDate);
    
    switch (groupBy) {
      case 'day':
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'week':
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'month':
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      default:
        periodEnd.setDate(periodEnd.getDate() + 1);
    }

    const periodEarnings = earningsHistory.filter(earning => {
      const earnedDate = new Date(earning.earnedAt);
      return earnedDate >= currentDate && earnedDate < periodEnd;
    }).reduce((sum, earning) => sum + earning.amount, 0);

    data.push({
      date: currentDate.toISOString(),
      period: groupBy,
      earnings: periodEarnings,
      count: periodEarnings.length
    });

    currentDate = new Date(periodEnd);
  }

  return data;
}

function generateDetailedMetrics(earningsHistory, referredUsers, affiliate) {
  // Calculate earnings by type
  const earningsByType = {};
  earningsHistory.forEach(earning => {
    const type = earning.type || 'unknown';
    if (!earningsByType[type]) {
      earningsByType[type] = 0;
    }
    earningsByType[type] += earning.amount;
  });

  const totalEarnings = earningsHistory.reduce((sum, earning) => sum + earning.amount, 0);

  // Top performing links (simulated)
  const topPerformingLinks = [
    {
      name: 'Main Registration',
      clicks: affiliate.clickCount || 0,
      conversions: referredUsers.length,
      earnings: earningsByType.registration_bonus || 0,
      conversionRate: affiliate.clickCount > 0 ? (referredUsers.length / affiliate.clickCount) * 100 : 0
    },
    {
      name: 'Sports Welcome Bonus',
      clicks: Math.floor((affiliate.clickCount || 0) * 0.3),
      conversions: Math.floor(referredUsers.length * 0.3),
      earnings: earningsByType.bet_commission || 0,
      conversionRate: Math.floor((referredUsers.length * 0.3) / ((affiliate.clickCount || 0) * 0.3)) * 100 || 0
    }
  ].filter(link => link.clicks > 0);

  // Referral sources (simulated)
  const referralSources = [
    { source: 'Direct', percentage: 35, conversions: Math.floor(referredUsers.length * 0.35) },
    { source: 'Facebook', percentage: 25, conversions: Math.floor(referredUsers.length * 0.25) },
    { source: 'Google', percentage: 20, conversions: Math.floor(referredUsers.length * 0.20) },
    { source: 'Email', percentage: 12, conversions: Math.floor(referredUsers.length * 0.12) },
    { source: 'Other', percentage: 8, conversions: Math.floor(referredUsers.length * 0.08) }
  ];

  // Geographic data
  const geographicData = [
    { country: 'Bangladesh', users: Math.floor(referredUsers.length * 0.6), earnings: (earningsByType.bet_commission || 0) * 0.6 },
    { country: 'United States', users: Math.floor(referredUsers.length * 0.15), earnings: (earningsByType.bet_commission || 0) * 0.15 },
    { country: 'United Kingdom', users: Math.floor(referredUsers.length * 0.10), earnings: (earningsByType.bet_commission || 0) * 0.10 },
    { country: 'Canada', users: Math.floor(referredUsers.length * 0.08), earnings: (earningsByType.bet_commission || 0) * 0.08 },
    { country: 'Australia', users: Math.floor(referredUsers.length * 0.07), earnings: (earningsByType.bet_commission || 0) * 0.07 }
  ];

  // Hourly performance (simulated)
  const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    clicks: Math.floor(((affiliate.clickCount || 0) / 30) * (0.5 + Math.random() * 1.0) / 24),
    conversions: Math.floor((referredUsers.length / 30) * (0.3 + Math.random() * 0.7) / 24),
    earnings: ((earningsByType.bet_commission || 0) / 30) * (0.4 + Math.random() * 0.8) / 24
  }));

  return {
    topPerformingLinks,
    referralSources,
    geographicData,
    hourlyPerformance,
    earningsByType: Object.entries(earningsByType).map(([type, amount]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      amount,
      percentage: totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0
    }))
  };
}

function calculateEarningsBreakdown(earningsData) {
  const breakdown = {
    byType: {},
    byStatus: {},
    total: 0
  };

  earningsData.forEach(earning => {
    // By type
    if (!breakdown.byType[earning.type]) {
      breakdown.byType[earning.type] = { amount: 0, count: 0 };
    }
    breakdown.byType[earning.type].amount += earning.amount;
    breakdown.byType[earning.type].count += 1;

    // By status
    if (!breakdown.byStatus[earning.status]) {
      breakdown.byStatus[earning.status] = { amount: 0, count: 0 };
    }
    breakdown.byStatus[earning.status].amount += earning.amount;
    breakdown.byStatus[earning.status].count += 1;

    breakdown.total += earning.amount;
  });

  return breakdown;
}

function calculateEarningsComparison(earningsHistory, currentRange) {
  const previousRange = calculatePreviousPeriod(currentRange);
  
  const currentEarnings = earningsHistory.filter(earning => {
    const earnedDate = new Date(earning.earnedAt);
    return earnedDate >= currentRange.startDate && earnedDate <= currentRange.endDate;
  }).reduce((sum, earning) => sum + earning.amount, 0);

  const previousEarnings = earningsHistory.filter(earning => {
    const earnedDate = new Date(earning.earnedAt);
    return earnedDate >= previousRange.startDate && earnedDate <= previousRange.endDate;
  }).reduce((sum, earning) => sum + earning.amount, 0);

  return {
    current: currentEarnings,
    previous: previousEarnings,
    growth: calculateGrowth(currentEarnings, previousEarnings)
  };
}

function calculateReferralMetrics(referredUsers) {
  const totalReferrals = referredUsers.length;
  const activeReferrals = referredUsers.filter(user => user.userStatus === 'active').length;
  const totalEarnings = referredUsers.reduce((sum, user) => sum + user.earnedAmount, 0);
  const averageEarning = totalReferrals > 0 ? totalEarnings / totalReferrals : 0;

  // Calculate activity levels
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const activeLast30Days = referredUsers.filter(user => 
    new Date(user.lastActivity) >= thirtyDaysAgo
  ).length;

  return {
    totalReferrals,
    activeReferrals,
    inactiveReferrals: totalReferrals - activeReferrals,
    activeLast30Days,
    totalEarnings,
    averageEarning: parseFloat(averageEarning.toFixed(2)),
    activityRate: parseFloat(((activeLast30Days / totalReferrals) * 100).toFixed(1))
  };
}

function getTopPerformingReferrals(referredUsers) {
  return referredUsers
    .map(user => ({
      userId: user.user._id,
      email: user.user.email,
      name: `${user.user.firstName} ${user.user.lastName}`,
      joinedAt: user.joinedAt,
      earnedAmount: user.earnedAmount,
      status: user.userStatus,
      lastActivity: user.lastActivity
    }))
    .sort((a, b) => b.earnedAmount - a.earnedAmount);
}

function calculateGeographicDistribution(referredUsers, earningsHistory) {
  const distribution = {};

  referredUsers.forEach(user => {
    const country = user.user.address?.country || user.user.country || 'Unknown';
    if (!distribution[country]) {
      distribution[country] = {
        users: 0,
        earnings: 0
      };
    }
    distribution[country].users += 1;
  });

  // Add earnings data
  earningsHistory.forEach(earning => {
    // This would need to be enhanced with actual user country data
    const country = 'Bangladesh'; // Default for simulation
    if (distribution[country]) {
      distribution[country].earnings += earning.amount;
    }
  });

  return distribution;
}

function getTopCountry(geographicData) {
  let topCountry = null;
  let maxUsers = 0;

  for (const [country, data] of Object.entries(geographicData)) {
    if (data.users > maxUsers) {
      maxUsers = data.users;
      topCountry = country;
    }
  }

  return topCountry;
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function calculateRank(earnings) {
  if (earnings > 5000) return 1;
  if (earnings > 2500) return 5;
  if (earnings > 1000) return 15;
  if (earnings > 500) return 30;
  if (earnings > 100) return 45;
  return 50;
}
// Update affiliate profile
Affiliateroute.put("/profile", authenticateAffiliate, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      company, 
      website, 
      promoMethod,
      socialMediaProfiles,
      address 
    } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Update fields if provided
    if (firstName) affiliate.firstName = firstName;
    if (lastName) affiliate.lastName = lastName;
    
    if (phone) {
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format. Use Bangladeshi format: 01XXXXXXXXX"
        });
      }
      
      const existingAffiliate = await Affiliate.findOne({ 
        phone, 
        _id: { $ne: affiliate._id } 
      });
      if (existingAffiliate) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered"
        });
      }
      
      affiliate.phone = phone;
    }
    
    if (company !== undefined) affiliate.company = company;
    if (website !== undefined) affiliate.website = website;
    if (promoMethod) affiliate.promoMethod = promoMethod;
    if (socialMediaProfiles) affiliate.socialMediaProfiles = socialMediaProfiles;
    if (address) affiliate.address = address;

    await affiliate.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      affiliate: {
        id: affiliate._id,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        phone: affiliate.phone,
        company: affiliate.company,
        website: affiliate.website,
        promoMethod: affiliate.promoMethod,
        socialMediaProfiles: affiliate.socialMediaProfiles,
        address: affiliate.address
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Update payment details
Affiliateroute.put("/profile/payment", authenticateAffiliate, async (req, res) => {
  try {
    const { paymentMethod, paymentDetails, minimumPayout, payoutSchedule, autoPayout } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Validate payment method
    const validPaymentMethods = ['bkash', 'nagad', 'rocket', 'binance', 'bank_transfer'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    if (paymentMethod) affiliate.paymentMethod = paymentMethod;
    if (minimumPayout !== undefined) affiliate.minimumPayout = minimumPayout;
    if (payoutSchedule) affiliate.payoutSchedule = payoutSchedule;
    if (autoPayout !== undefined) affiliate.autoPayout = autoPayout;

    // Update payment details based on method
    if (paymentDetails) {
      const phoneRegex = /^01[3-9]\d{8}$/;
      
      if (['bkash', 'nagad', 'rocket'].includes(affiliate.paymentMethod)) {
        if (paymentDetails.phoneNumber) {
          if (!phoneRegex.test(paymentDetails.phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${affiliate.paymentMethod} phone number format. Use Bangladeshi format: 01XXXXXXXXX`
            });
          }
          affiliate.paymentDetails[affiliate.paymentMethod] = {
            phoneNumber: paymentDetails.phoneNumber,
            accountType: paymentDetails.accountType || 'personal'
          };
        }
      } else if (affiliate.paymentMethod === 'binance') {
        if (paymentDetails.email || paymentDetails.walletAddress) {
          if (paymentDetails.email && !/\S+@\S+\.\S+/.test(paymentDetails.email)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Binance email format'
            });
          }
          affiliate.paymentDetails.binance = {
            email: paymentDetails.email || affiliate.paymentDetails.binance?.email,
            walletAddress: paymentDetails.walletAddress || affiliate.paymentDetails.binance?.walletAddress,
            binanceId: paymentDetails.binanceId || affiliate.paymentDetails.binance?.binanceId
          };
        }
      } else if (affiliate.paymentMethod === 'bank_transfer') {
        affiliate.paymentDetails.bank_transfer = {
          bankName: paymentDetails.bankName || affiliate.paymentDetails.bank_transfer?.bankName,
          accountName: paymentDetails.accountName || affiliate.paymentDetails.bank_transfer?.accountName,
          accountNumber: paymentDetails.accountNumber || affiliate.paymentDetails.bank_transfer?.accountNumber,
          branchName: paymentDetails.branchName || affiliate.paymentDetails.bank_transfer?.branchName,
          routingNumber: paymentDetails.routingNumber || affiliate.paymentDetails.bank_transfer?.routingNumber,
          swiftCode: paymentDetails.swiftCode || affiliate.paymentDetails.bank_transfer?.swiftCode
        };
      }
    }

    await affiliate.save();

    res.json({
      success: true,
      message: "Payment details updated successfully",
      paymentDetails: {
        paymentMethod: affiliate.paymentMethod,
        minimumPayout: affiliate.minimumPayout,
        payoutSchedule: affiliate.payoutSchedule,
        autoPayout: affiliate.autoPayout,
        formattedPaymentDetails: affiliate.formattedPaymentDetails
      }
    });
  } catch (error) {
    console.error("Update payment details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Change password
Affiliateroute.put("/profile/change-password", authenticateAffiliate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId).select('+password');
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirm password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, affiliate.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    affiliate.password = newPassword;
    await affiliate.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== DASHBOARD & ANALYTICS ROUTES ====================

// Get affiliate dashboard stats
Affiliateroute.get("/dashboard", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Calculate earnings summary from earningsHistory
    const earningsSummary = affiliate.getEarningsSummary();
    
    // Calculate monthly growth
    const monthlyGrowth = calculateMonthlyGrowth(affiliate.earningsHistory);
    
    // Calculate earnings by time range
    const earningsByTimeRange = calculateEarningsByTimeRange(affiliate.earningsHistory, 'month');
    
    // Get recent transactions (last 10 earnings)
    const recentTransactions = affiliate.earningsHistory
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 10)
      .map(earning => ({
        id: earning._id,
        type: earning.type,
        description: earning.description,
        amount: earning.amount,
        status: earning.status,
        date: earning.earnedAt,
        sourceType: earning.sourceType,
        commissionRate: earning.commissionRate,
        sourceAmount: earning.sourceAmount,
        referredUser: earning.referredUser,
        metadata: earning.metadata
      }));

    // Calculate performance metrics
    const totalEarnings = affiliate.totalEarnings || 0;
    const pendingEarnings = affiliate.pendingEarnings || 0;
    const paidEarnings = affiliate.paidEarnings || 0;
    const referralCount = affiliate.referralCount || 0;
    const activeReferrals = affiliate.activeReferrals || 0;
    const clickCount = affiliate.clickCount || 0;
    const conversionRate = affiliate.conversionRate || 0;
    const averageEarningPerReferral = affiliate.averageEarningPerReferral || 0;
    const earningsThisMonth = affiliate.earningsThisMonth || 0;

    // Calculate earnings by type for breakdown
    const earningsByType = {};
    affiliate.earningsHistory.forEach(earning => {
      if (!earningsByType[earning.type]) {
        earningsByType[earning.type] = {
          total: 0,
          count: 0,
          label: getEarningTypeLabel(earning.type)
        };
      }
      earningsByType[earning.type].total += earning.amount;
      earningsByType[earning.type].count += 1;
    });

    const dashboardStats = {
      // Earnings Summary
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      earningsThisMonth,
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
      
      // Referrals
      referralCount,
      activeReferrals,
      inactiveReferrals: referralCount - activeReferrals,
      
      // Performance
      clickCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageEarningPerReferral: parseFloat(averageEarningPerReferral.toFixed(2)),
      
      // Payout
      commissionRate: affiliate.commissionRate,
      depositRate: affiliate.depositRate,
      cpaRate: affiliate.cpaRate,
      minimumPayout: affiliate.minimumPayout,
      availableForPayout: pendingEarnings,
      canRequestPayout: pendingEarnings >= affiliate.minimumPayout,
      
      // Earnings Breakdown
      earningsSummary: {
        total: earningsSummary.total,
        pending: earningsSummary.pending,
        paid: earningsSummary.paid,
        byType: earningsByType
      },
      
      // Recent Activity
      recentTransactions,
      
      // Calculations
      estimatedMonthlyEarnings: parseFloat((totalEarnings / (affiliate.createdAt ? Math.max(1, Math.ceil((Date.now() - affiliate.createdAt) / (30 * 24 * 60 * 60 * 1000))) : 1)).toFixed(2)),
      
      // Additional Info
      affiliateSince: affiliate.createdAt,
      lastPayoutDate: affiliate.lastPayoutDate,
      paymentMethod: affiliate.paymentMethod,
      payoutSchedule: affiliate.payoutSchedule
    };

    res.json({
      success: true,
      stats: dashboardStats,
      affiliate: {
        affiliateCode: affiliate.affiliateCode,
        customAffiliateCode: affiliate.customAffiliateCode,
        fullName: affiliate.fullName,
        email: affiliate.email,
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Helper function to calculate monthly growth
function calculateMonthlyGrowth(earningsHistory) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate current month earnings
  const currentMonthEarnings = earningsHistory
    .filter(earning => {
      const earningDate = new Date(earning.earnedAt);
      return earningDate.getMonth() === currentMonth && 
             earningDate.getFullYear() === currentYear &&
             earning.status !== 'cancelled';
    })
    .reduce((total, earning) => total + earning.amount, 0);

  // Calculate last month earnings
  const lastMonthEarnings = earningsHistory
    .filter(earning => {
      const earningDate = new Date(earning.earnedAt);
      return earningDate.getMonth() === lastMonth && 
             earningDate.getFullYear() === lastMonthYear &&
             earning.status !== 'cancelled';
    })
    .reduce((total, earning) => total + earning.amount, 0);

  if (lastMonthEarnings === 0) {
    return currentMonthEarnings > 0 ? 100 : 0;
  }

  return ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
}

// Helper function to calculate earnings by time range
function calculateEarningsByTimeRange(earningsHistory, range) {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(0); // All time
  }

  return earningsHistory
    .filter(earning => new Date(earning.earnedAt) >= startDate && earning.status !== 'cancelled')
    .reduce((total, earning) => total + earning.amount, 0);
}

// Helper function to get human-readable earning type labels
function getEarningTypeLabel(type) {
  const typeLabels = {
    'deposit_commission': 'Deposit Commission',
    'bet_commission': 'Bet Commission',
    'withdrawal_commission': 'Withdrawal Commission',
    'registration_bonus': 'Registration Bonus',
    'cpa': 'CPA',
    'other': 'Other'
  };
  return typeLabels[type] || type;
}

// Get referral performance analytics
Affiliateroute.get("/analytics/referrals", authenticateAffiliate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const affiliate = await Affiliate.findById(req.affiliateId).populate('referredUsers.user', 'email createdAt lastLogin');
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const analytics = {
      totalReferrals: affiliate.referralCount,
      activeReferrals: affiliate.activeReferrals,
      totalEarnings: affiliate.totalEarnings,
      averageEarningPerReferral: affiliate.averageEarningPerReferral,
      conversionRate: affiliate.conversionRate,
      
      referralBreakdown: affiliate.referredUsers.map(ref => ({
        userId: ref.user._id,
        userEmail: ref.user.email,
        joinedAt: ref.joinedAt,
        earnedAmount: ref.earnedAmount,
        status: ref.userStatus,
        lastActivity: ref.lastActivity
      })).sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Referral analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get earnings report
Affiliateroute.get("/analytics/earnings", authenticateAffiliate, async (req, res) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // This would typically query an Earnings collection
    // For now, we'll return summary data
    const earningsReport = {
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: endDate || new Date()
      },
      summary: {
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings,
        paidEarnings: affiliate.paidEarnings,
        earningsThisMonth: affiliate.earningsThisMonth
      },
      // In a real implementation, you'd have detailed earnings records
      recentEarnings: affiliate.referredUsers.slice(0, 10).map(ref => ({
        date: ref.lastActivity,
        amount: ref.earnedAmount,
        type: 'commission',
        description: `Commission from referral`
      }))
    };

    res.json({
      success: true,
      report: earningsReport
    });
  } catch (error) {
    console.error("Earnings report error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== REFERRAL & TRACKING ROUTES ====================

// Track referral click
Affiliateroute.post("/track-click", async (req, res) => {
  try {
    const { affiliateCode } = req.body;

    if (!affiliateCode) {
      return res.status(400).json({
        success: false,
        message: "Affiliate code is required"
      });
    }

    const affiliate = await Affiliate.findByCode(affiliateCode);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid affiliate code"
      });
    }

    await affiliate.trackClick();

    res.json({
      success: true,
      message: "Click tracked successfully",
      affiliateId: affiliate._id
    });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get referral links and creatives
Affiliateroute.get("/referral-tools", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    const baseUrl = process.env.BASE_URL || "https://your-betting-site.com";
    const referralCode = affiliate.customAffiliateCode || affiliate.affiliateCode;

    const referralTools = {
      referralLinks: {
        main: `${baseUrl}/register?ref=${referralCode}`,
        deposit: `${baseUrl}/deposit?ref=${referralCode}`,
        sportsbook: `${baseUrl}/sports?ref=${referralCode}`,
        casino: `${baseUrl}/casino?ref=${referralCode}`
      },
      creatives: {
        banners: [
          {
            size: "728x90",
            code: `<a href="${baseUrl}/register?ref=${referralCode}" target="_blank"><img src="${baseUrl}/banners/728x90.jpg" alt="Betting Site" /></a>`,
            imageUrl: `${baseUrl}/banners/728x90.jpg`
          },
          {
            size: "300x250",
            code: `<a href="${baseUrl}/register?ref=${referralCode}" target="_blank"><img src="${baseUrl}/banners/300x250.jpg" alt="Betting Site" /></a>`,
            imageUrl: `${baseUrl}/banners/300x250.jpg`
          }
        ],
        textLinks: [
          {
            text: "Join Best Betting Site",
            code: `<a href="${baseUrl}/register?ref=${referralCode}" target="_blank">Join Best Betting Site</a>`
          }
        ]
      },
      affiliateCode: referralCode
    };

    res.json({
      success: true,
      tools: referralTools
    });
  } catch (error) {
    console.error("Referral tools error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== PAYOUT ROUTES ====================

// Request payout
Affiliateroute.post("/payout/request", authenticateAffiliate, async (req, res) => {
  try {
    const { amount } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Validate amount
    const payoutAmount = amount || affiliate.pendingEarnings;
    
    if (payoutAmount < affiliate.minimumPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ${affiliate.minimumPayout}`
      });
    }

    if (payoutAmount > affiliate.pendingEarnings) {
      return res.status(400).json({
        success: false,
        message: "Insufficient pending earnings"
      });
    }

    // Process payout (in real implementation, this would create a payout request)
    // For now, we'll simulate processing
    const transactionId = `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await affiliate.processPayout(payoutAmount, transactionId);

    res.json({
      success: true,
      message: "Payout request submitted successfully",
      payout: {
        amount: payoutAmount,
        transactionId,
        paymentMethod: affiliate.paymentMethod,
        paymentDetails: affiliate.formattedPaymentDetails,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Payout request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

// Get payout history
Affiliateroute.get("/payout/history", authenticateAffiliate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // In a real implementation, you would query a Payout collection
    // For now, return mock data or integrate with your Payout model
    const payoutHistory = {
      total: 1,
      page: parseInt(page),
      limit: parseInt(limit),
      payouts: [
        {
          id: "1",
          amount: 150,
          status: "completed",
          paymentMethod: "bkash",
          transactionId: "TX123456789",
          processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          paymentDetails: {
            phoneNumber: "01XXXXXXXXX",
            accountType: "personal"
          }
        }
      ]
    };

    res.json({
      success: true,
      history: payoutHistory
    });
  } catch (error) {
    console.error("Payout history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all affiliates (Admin only)
Affiliateroute.get("/admin/affiliates", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { affiliateCode: { $regex: search, $options: 'i' } }
      ];
    }

    const affiliates = await Affiliate.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Affiliate.countDocuments(query);

    res.json({
      success: true,
      affiliates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Admin get affiliates error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Update affiliate status (Admin only)
Affiliateroute.put("/admin/affiliates/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'active', 'suspended', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    affiliate.status = status;
    if (notes) affiliate.notes = notes;
    await affiliate.save();

    res.json({
      success: true,
      message: `Affiliate status updated to ${status}`,
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        fullName: affiliate.fullName,
        status: affiliate.status,
        notes: affiliate.notes
      }
    });
  } catch (error) {
    console.error("Admin update affiliate status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Update affiliate commission (Admin only)
Affiliateroute.put("/admin/affiliates/:id/commission", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate, commissionType, cpaRate } = req.body;

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    if (commissionRate !== undefined) {
      if (commissionRate < 0.01 || commissionRate > 0.5) {
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 1% and 50%"
        });
      }
      affiliate.commissionRate = commissionRate;
    }

    if (commissionType) affiliate.commissionType = commissionType;
    if (cpaRate !== undefined) affiliate.cpaRate = cpaRate;

    await affiliate.save();

    res.json({
      success: true,
      message: "Commission settings updated successfully",
      commission: {
        commissionRate: affiliate.commissionRate,
        commissionType: affiliate.commissionType,
        cpaRate: affiliate.cpaRate
      }
    });
  } catch (error) {
    console.error("Admin update commission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Verify affiliate code
Affiliateroute.get("/verify-code/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const affiliate = await Affiliate.findByCode(code);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid affiliate code"
      });
    }

    res.json({
      success: true,
      affiliate: {
        id: affiliate._id,
        fullName: affiliate.fullName,
        company: affiliate.company,
        isActive: affiliate.status === 'active'
      }
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Check affiliate status
Affiliateroute.get("/status", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    res.json({
      success: true,
      status: {
        isActive: affiliate.status === 'active',
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus,
        canWithdraw: affiliate.pendingEarnings >= affiliate.minimumPayout
      }
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Logout
Affiliateroute.post("/logout", authenticateAffiliate, async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// ==================== PAYOUT ROUTES ====================

// Request payout
Affiliateroute.post("/payout/request", authenticateAffiliate, async (req, res) => {
  try {
    const { amount, notes } = req.body;

    const affiliate = await Affiliate.findById(req.affiliateId);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Validate amount
    const payoutAmount = amount || affiliate.pendingEarnings;
    
    if (payoutAmount < affiliate.minimumPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ${affiliate.minimumPayout}`
      });
    }

    if (payoutAmount > affiliate.pendingEarnings) {
      return res.status(400).json({
        success: false,
        message: "Insufficient pending earnings"
      });
    }

    if (!affiliate.paymentMethod || !affiliate.paymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Please set up your payment method before requesting payout"
      });
    }

    // Get pending earnings for this payout
    const pendingEarnings = affiliate.earningsHistory
      .filter(earning => earning.status === 'pending')
      .sort((a, b) => new Date(a.earnedAt) - new Date(b.earnedAt));

    let amountProcessed = 0;
    const includedEarnings = [];

    for (let earning of pendingEarnings) {
      if (amountProcessed < payoutAmount) {
        const remainingAmount = payoutAmount - amountProcessed;
        const earningAmount = Math.min(earning.amount, remainingAmount);
        
        includedEarnings.push({
          earningId: earning._id,
          amount: earningAmount,
          type: earning.type,
          description: earning.description,
          earnedAt: earning.earnedAt
        });
        
        amountProcessed += earningAmount;
      }
      
      if (amountProcessed >= payoutAmount) break;
    }

    // Create payout record
    const payout = await Payout.create({
      affiliate: affiliate._id,
      amount: payoutAmount,
      currency: 'BDT',
      status: 'pending',
      payoutType: 'regular',
      paymentMethod: affiliate.paymentMethod,
      paymentDetails: affiliate.paymentDetails,
      includedEarnings: includedEarnings,
      netAmount: payoutAmount,
      requestedAt: new Date(),
      notes: notes || 'Payout request from affiliate',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Update affiliate's earnings status to processing
    for (let earning of includedEarnings) {
      const earningRecord = affiliate.earningsHistory.id(earning.earningId);
      if (earningRecord) {
        earningRecord.status = 'processing';
        earningRecord.payoutId = payout._id;
      }
    }

    affiliate.pendingEarnings -= payoutAmount;
    await affiliate.save();

    res.json({
      success: true,
      message: "Payout request submitted successfully",
      payout: {
        id: payout._id,
        payoutId: payout.payoutId,
        amount: payout.amount,
        netAmount: payout.netAmount,
        status: payout.status,
        paymentMethod: payout.paymentMethod,
        requestedAt: payout.requestedAt,
        estimatedCompletionDate: payout.estimatedCompletionDate
      }
    });
  } catch (error) {
    console.error("Payout request error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

// Get payout history
Affiliateroute.get("/payout/history", authenticateAffiliate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const filters = { status, startDate, endDate };
    const payouts = await Payout.findByAffiliate(req.affiliateId, filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments({ affiliate: req.affiliateId });

    // Calculate summary
    const summary = await Payout.aggregate([
      {
        $match: { affiliate: req.affiliateId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPaid = await Payout.aggregate([
      {
        $match: { 
          affiliate: req.affiliateId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      payouts,
      summary: {
        byStatus: summary,
        totalPaid: totalPaid[0]?.total || 0,
        totalPayouts: total
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Payout history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get single payout details
Affiliateroute.get("/payout/:id", authenticateAffiliate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const payout = await Payout.findOne({
      _id: id,
      affiliate: req.affiliateId
    }).populate('includedEarnings.earningId');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found"
      });
    }

    res.json({
      success: true,
      payout
    });
  } catch (error) {
    console.error("Get payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Cancel payout request
Affiliateroute.post("/payout/:id/cancel", authenticateAffiliate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payout = await Payout.findOne({
      _id: id,
      affiliate: req.affiliateId
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found"
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending payouts can be cancelled"
      });
    }

    // Update payout status
    await payout.updateStatus('cancelled', `Cancelled by affiliate: ${reason}`);

    // Restore earnings to pending status
    const affiliate = await Affiliate.findById(req.affiliateId);
    for (let earning of payout.includedEarnings) {
      const earningRecord = affiliate.earningsHistory.id(earning.earningId);
      if (earningRecord) {
        earningRecord.status = 'pending';
        earningRecord.payoutId = undefined;
      }
    }

    affiliate.pendingEarnings += payout.amount;
    await affiliate.save();

    res.json({
      success: true,
      message: "Payout request cancelled successfully"
    });
  } catch (error) {
    console.error("Cancel payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get payout statistics
Affiliateroute.get("/payout/stats", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.affiliateId);
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    // Calculate payout stats
    const payoutStats = await Payout.aggregate([
      {
        $match: { affiliate: affiliate._id }
      },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayouts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingPayouts: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          averagePayout: { $avg: '$amount' },
          largestPayout: { $max: '$amount' }
        }
      }
    ]);

    // Monthly payout trend
    const monthlyTrend = await Payout.aggregate([
      {
        $match: { 
          affiliate: affiliate._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 6
      }
    ]);

    const stats = payoutStats[0] || {
      totalPayouts: 0,
      totalAmount: 0,
      completedPayouts: 0,
      pendingPayouts: 0,
      averagePayout: 0,
      largestPayout: 0
    };

    res.json({
      success: true,
      stats: {
        ...stats,
        availableForPayout: affiliate.pendingEarnings,
        minimumPayout: affiliate.minimumPayout,
        canRequestPayout: affiliate.pendingEarnings >= affiliate.minimumPayout,
        nextPayoutDate: calculateNextPayoutDate(affiliate.payoutSchedule),
        monthlyTrend: monthlyTrend
      }
    });
  } catch (error) {
    console.error("Payout stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Helper function to calculate next payout date
function calculateNextPayoutDate(payoutSchedule) {
  const now = new Date();
  
  switch (payoutSchedule) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'bi_weekly':
      return new Date(now.setDate(now.getDate() + 14));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return null;
  }
}
// ----------------- MASTER AFFILIATE ROUTES ---------------------

// Super Affiliate creates Master Affiliate
Affiliateroute.post("/master-affiliate/register", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      paymentMethod,
      paymentDetails,
      commissionSettings
    } = req.body;
    console.log("dfsdf",req.body)
    // Get super affiliate ID from auth token or request
    const superAffiliateId =req.body.createdBy;

    if (!superAffiliateId) {
      return res.status(400).json({
        success: false,
        message: "Super affiliate ID is required"
      });
    }

    // Check if super affiliate exists and has proper role
    const superAffiliate = await Affiliate.findById(superAffiliateId);
    if (!superAffiliate) {
      return res.status(403).json({
        success: false,
        message: "Only super affiliates can create master affiliates"
      });
    }

    // Check if super affiliate is active
    if (superAffiliate.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: "Your super affiliate account is not active"
      });
    }

    // Validation
    if (!email || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, last name, and phone are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Validate payment method and details
    if (paymentMethod) {
      switch (paymentMethod) {
        case 'bkash':
        case 'nagad':
        case 'rocket':
          if (!paymentDetails?.phoneNumber) {
            return res.status(400).json({
              success: false,
              message: `${paymentMethod} phone number is required`
            });
          }
          if (!/^01[3-9]\d{8}$/.test(paymentDetails.phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${paymentMethod} phone number. Use format: 01XXXXXXXXX`
            });
          }
          break;
        
        case 'binance':
          if (!paymentDetails?.email) {
            return res.status(400).json({
              success: false,
              message: "Binance email is required"
            });
          }
          if (!/\S+@\S+\.\S+/.test(paymentDetails.email)) {
            return res.status(400).json({
              success: false,
              message: "Binance email is invalid"
            });
          }
          if (!paymentDetails?.walletAddress) {
            return res.status(400).json({
              success: false,
              message: "Binance wallet address is required"
            });
          }
          break;
        
        case 'bank_transfer':
          if (!paymentDetails?.accountNumber || !paymentDetails?.bankName || !paymentDetails?.accountName) {
            return res.status(400).json({
              success: false,
              message: "Bank account details are required for bank transfer"
            });
          }
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: "Please select a valid payment method"
          });
      }
    }

    // Check if master affiliate already exists
    const existingAffiliate = await MasterAffiliate.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingAffiliate) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this email or phone already exists"
      });
    }

    // Prepare payment details for database
    const dbPaymentDetails = {};
    if (paymentMethod && paymentDetails) {
      dbPaymentDetails[paymentMethod] = paymentDetails;
      
      // Set default accountType for mobile payment methods
      if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
        if (!dbPaymentDetails[paymentMethod].accountType) {
          dbPaymentDetails[paymentMethod].accountType = 'personal';
        }
      }
    }

    // Set commission rates for master affiliate
    const masterCommissionSettings = {
      commissionRate: commissionSettings?.commissionRate, // Higher default for masters
      depositRate: commissionSettings?.depositRate,
      cpaRate: commissionSettings?.cpaRate,
      commissionType: commissionSettings?.commissionType || 'revenue_share'
    };
  const haspassword=await bcrypt.hash(password,10)
    // Create new master affiliate
    const masterAffiliate = new MasterAffiliate({
      email: email.toLowerCase(),
      password:haspassword,
      firstName,
      lastName,
      phone,
      company: company || '',
      website: website || '',
      promoMethod: promoMethod || 'other',
      paymentMethod: paymentMethod || 'bkash',
      paymentDetails: dbPaymentDetails,
      // Master affiliate specific fields
      role: "master_affiliate",
      createdBy: superAffiliateId,
      // Commission settings
      commissionRate: masterCommissionSettings.commissionRate,
      depositRate: masterCommissionSettings.depositRate,
      cpaRate: masterCommissionSettings.cpaRate,
      commissionType: masterCommissionSettings.commissionType,  
      // Higher minimum payout for masters
      minimumPayout: 2000,
      status: 'pending',
      verificationStatus: 'unverified'
    });

    await masterAffiliate.save();

    res.status(201).json({
      success: true,
      message: "Master affiliate registered successfully. Please wait for admin approval.",
      data: {
        masterAffiliate: {
          id: masterAffiliate._id,
          email: masterAffiliate.email,
          firstName: masterAffiliate.firstName,
          lastName: masterAffiliate.lastName,
          affiliateCode: masterAffiliate.affiliateCode,
          role: masterAffiliate.role,
          status: masterAffiliate.status,
          verificationStatus: masterAffiliate.verificationStatus,
          commissionRate: masterAffiliate.commissionRate,
          depositRate: masterAffiliate.depositRate,
          createdBy: masterAffiliate.createdBy
        }
      }
    });

  } catch (error) {
    console.error("Master affiliate registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Master affiliate with this email or phone already exists"
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during master affiliate registration"
    });
  }
});

// Get all master affiliates created by a specific super affiliate
Affiliateroute.get("/all-master-affiliate/:id", async (req, res) => {
  try {
    const masterAffiliates = await MasterAffiliate.find({ 
      createdBy: req.params.id,
      role: 'master_affiliate'
    }).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');


    res.json({
      success: true,
      count: masterAffiliates.length,
      data: masterAffiliates
    });
  } catch (error) {
    console.error("Error fetching master affiliates:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get master affiliate by ID
Affiliateroute.get("/master-affiliate/:id", async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findOne({
      _id: req.params.id,
      role: 'master_affiliate'
    }).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master affiliate not found"
      });
    }

    res.json({
      success: true,
      data: masterAffiliate
    });
  } catch (error) {
    console.error("Error fetching master affiliate:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Update master affiliate
Affiliateroute.put('/master-affiliate/:id', async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findOne({
      _id: req.params.id,
      role: 'master_affiliate'
    });
      console.log(req.params.id)
    if (!masterAffiliate) {
      return res.status(404).json({ 
        success: false,
        message: 'Master affiliate not found' 
      });
    }

    const {
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      commissionRate,
      depositRate,
      commissionType,
      cpaRate,
      status,
      verificationStatus,
      paymentMethod,
      paymentDetails,
      minimumPayout,
      payoutSchedule,
      autoPayout,
      notes,
      tags
    } = req.body;

    // Update basic information
    if (firstName) masterAffiliate.firstName = firstName;
    if (lastName) masterAffiliate.lastName = lastName;
    if (phone) masterAffiliate.phone = phone;
    if (company !== undefined) masterAffiliate.company = company;
    if (website !== undefined) masterAffiliate.website = website;
    if (promoMethod) masterAffiliate.promoMethod = promoMethod;

    // Update commission structure (with validation for masters)
    if (commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 50) {
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 0% and 50% for master affiliates"
        });
      }
      masterAffiliate.commissionRate = commissionRate;
    }

    if (depositRate !== undefined) {
      if (depositRate < 0 || depositRate > 20) {
        return res.status(400).json({
          success: false,
          message: "Deposit rate must be between 0% and 20% for master affiliates"
        });
      }
      masterAffiliate.depositRate = depositRate;
    }

    if (commissionType) masterAffiliate.commissionType = commissionType;
    if (cpaRate !== undefined) masterAffiliate.cpaRate = cpaRate;

    // Update status
    if (status) masterAffiliate.status = status;
    if (verificationStatus) masterAffiliate.verificationStatus = verificationStatus;

    // Update payment information
    if (paymentMethod) masterAffiliate.paymentMethod = paymentMethod;
    
    if (paymentDetails) {
      // Update specific payment details
      if (masterAffiliate.paymentDetails[paymentMethod]) {
        masterAffiliate.paymentDetails[paymentMethod] = {
          ...masterAffiliate.paymentDetails[paymentMethod],
          ...paymentDetails
        };
      } else {
        masterAffiliate.paymentDetails[paymentMethod] = paymentDetails;
      }
    }

    // Update payout settings
    if (minimumPayout !== undefined) {
      if (minimumPayout < 2000) {
        return res.status(400).json({
          success: false,
          message: "Minimum payout for master affiliates must be at least 2000"
        });
      }
      masterAffiliate.minimumPayout = minimumPayout;
    }

    if (payoutSchedule) masterAffiliate.payoutSchedule = payoutSchedule;
    if (autoPayout !== undefined) masterAffiliate.autoPayout = autoPayout;
    if (notes !== undefined) masterAffiliate.notes = notes;
    if (tags !== undefined) masterAffiliate.tags = tags;

    await masterAffiliate.save();

    res.json({
      success: true,
      message: 'Master affiliate updated successfully',
      data: masterAffiliate
    });

  } catch (error) {
    console.error('Error updating master affiliate:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to update master affiliate' 
    });
  }
});

// Update master affiliate status
Affiliateroute.put('/master-affiliate/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
     console.log(req.params.id)
    const validStatuses = ['pending', 'active', 'suspended', 'banned', 'inactive'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid status is required' 
      });
    }
    
    const masterAffiliate = await MasterAffiliate.findOneAndUpdate(
      { _id: req.params.id, role: 'master_affiliate' },
      { status },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
    
    if (!masterAffiliate) {
      return res.status(404).json({ 
        success: false,
        message: 'Master affiliate not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Master affiliate status updated successfully',
      data: masterAffiliate
    });
  } catch (error) {
    console.error('Error updating master affiliate status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update master affiliate status' 
    });
  }
});

// Update master affiliate commission structure
Affiliateroute.put('/master-affiliate/:id/commission', async (req, res) => {
  try {
    const { commissionRate, depositRate, commissionType, cpaRate } = req.body;
     console.log(req.params.id)
    const masterAffiliate = await MasterAffiliate.findOne({
      _id: req.params.id,
      role: 'master_affiliate'
    });
    
    if (!masterAffiliate) {
      return res.status(404).json({ 
        success: false,
        message: 'Master affiliate not found' 
      });
    }
    
    // Validate and update commission rates
    if (commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 50) {
        return res.status(400).json({
          success: false,
          message: 'Commission rate must be between 0% and 50% for master affiliates'
        });
      }
      masterAffiliate.commissionRate = commissionRate;
    }
    
    if (depositRate !== undefined) {
      if (depositRate < 0 || depositRate > 20) {
        return res.status(400).json({
          success: false,
          message: 'Deposit rate must be between 0% and 20% for master affiliates'
        });
      }
      masterAffiliate.depositRate = depositRate;
    }
    
    if (commissionType) {
      masterAffiliate.commissionType = commissionType;
    }
    
    if (cpaRate !== undefined) {
      if (cpaRate < 0) {
        return res.status(400).json({
          success: false,
          message: 'CPA rate cannot be negative'
        });
      }
      masterAffiliate.cpaRate = cpaRate;
    }
    
    await masterAffiliate.save();
    
    res.json({
      success: true,
      message: 'Master affiliate commission structure updated successfully',
      data: {
        commissionRate: masterAffiliate.commissionRate,
        depositRate: masterAffiliate.depositRate,
        commissionType: masterAffiliate.commissionType,
        cpaRate: masterAffiliate.cpaRate
      }
    });
  } catch (error) {
    console.error('Error updating master affiliate commission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update master affiliate commission structure' 
    });
  }
});

// Delete master affiliate
Affiliateroute.delete('/master-affiliate/:id', async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findOne({
      _id: req.params.id,
      role: 'master_affiliate'
    });
    
    if (!masterAffiliate) {
      return res.status(404).json({ 
        success: false,
        message: 'Master affiliate not found' 
      });
    }
    
    // Check if master affiliate has any sub-affiliates or earnings
    if (masterAffiliate.referralCount > 0 || masterAffiliate.totalEarnings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete master affiliate with existing referrals or earnings. Consider suspending instead.'
      });
    }
    
    await Affiliate.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Master affiliate deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting master affiliate:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete master affiliate' 
    });
  }
});

// Get master affiliate performance stats
Affiliateroute.get('/master-affiliate/:id/performance', async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findOne({
      _id: req.params.id,
      role: 'master_affiliate'
    });

    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: 'Master affiliate not found'
      });
    }

    const performanceStats = {
      totalEarnings: masterAffiliate.totalEarnings,
      pendingEarnings: masterAffiliate.pendingEarnings,
      paidEarnings: masterAffiliate.paidEarnings,
      referralCount: masterAffiliate.referralCount,
      activeReferrals: masterAffiliate.activeReferrals,
      conversionRate: masterAffiliate.conversionRate,
      averageEarningPerReferral: masterAffiliate.averageEarningPerReferral,
      earningsThisMonth: masterAffiliate.earningsThisMonth,
      clickCount: masterAffiliate.clickCount
    };

    res.json({
      success: true,
      data: performanceStats
    });
  } catch (error) {
    console.error('Error fetching master affiliate performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance stats'
    });
  }
});

// Get all master affiliates (for admin)
Affiliateroute.get("/master-affiliates", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = { role: 'master_affiliate' };
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { affiliateCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    const masterAffiliates = await MasterAffiliate.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
      .populate('createdBy', 'firstName lastName email affiliateCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Affiliate.countDocuments(query);
    
    res.json({
      success: true,
      data: masterAffiliates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching master affiliates:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ==================== COMMISSION STRUCTURE ROUTES ====================

// GET commission structure settings
Affiliateroute.get('/affiliates/commission-structure', async (req, res) => {
  try {
    // Get default commission structure from settings or return default values
    const defaultCommission = {
      revenue_share: {
        defaultRate: 0.1,
        minRate: 0.01,
        maxRate: 0.5
      },
      cpa: {
        defaultRate: 0,
        minRate: 0,
        maxRate: 1000
      },
      hybrid: {
        revenueShareRate: 0.05,
        cpaRate: 50
      },
      tiers: [
        {
          level: 1,
          name: 'Bronze',
          minReferrals: 0,
          commissionRate: 0.1
        },
        {
          level: 2,
          name: 'Silver',
          minReferrals: 10,
          commissionRate: 0.15
        },
        {
          level: 3,
          name: 'Gold',
          minReferrals: 25,
          commissionRate: 0.2
        },
        {
          level: 4,
          name: 'Platinum',
          minReferrals: 50,
          commissionRate: 0.25
        }
      ]
    };
    
    res.json(defaultCommission);
  } catch (error) {
    console.error('Error fetching commission structure:', error);
    res.status(500).json({ error: 'Failed to fetch commission structure' });
  }
});

// PUT update commission structure
Affiliateroute.put('/affiliates/commission-structure', async (req, res) => {
  try {
    const { revenue_share, cpa, hybrid, tiers } = req.body;
    
    // Here you would typically save this to a settings collection
    // For now, we'll just return the updated structure
    
    const updatedStructure = {
      revenue_share: revenue_share || {
        defaultRate: 0.1,
        minRate: 0.01,
        maxRate: 0.5
      },
      cpa: cpa || {
        defaultRate: 0,
        minRate: 0,
        maxRate: 1000
      },
      hybrid: hybrid || {
        revenueShareRate: 0.05,
        cpaRate: 50
      },
      tiers: tiers || [
        {
          level: 1,
          name: 'Bronze',
          minReferrals: 0,
          commissionRate: 0.1
        }
      ]
    };
    
    res.json({
      message: 'Commission structure updated successfully',
      commissionStructure: updatedStructure
    });
  } catch (error) {
    console.error('Error updating commission structure:', error);
    res.status(500).json({ error: 'Failed to update commission structure' });
  }
});


// -----------master-withdraw---------------------

Affiliateroute.get("/master-payout/:id",async(req,res)=>{
  try {
    const matchpayout=await Payout.find({super_affiliate:req.params.id });
    res.send({success:true,data:matchpayout})
  } catch (error) {
    console.log(error);
  }
})
// Update payout status (Admin only)
Affiliateroute.put("/admin/payout/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, processedBy } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Valid status values
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, processing, completed, failed, cancelled, on_hold"
      });
    }

    // Find the payout
    const payout = await Payout.findById(id).populate('affiliate');
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found"
      });
    }

    const oldStatus = payout.status;
    
    // If changing to completed, handle balance updates
    if (status === 'completed' && oldStatus !== 'completed') {
      // Update affiliate's paid earnings and reset pending earnings
      const affiliate = await Affiliate.findById(payout.super_affiliate);
      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: "Affiliate not found"
        });
      }

      // Update affiliate earnings
      affiliate.totalEarnings += payout.amount;
      affiliate.pendingEarnings += payout.amount;
      affiliate.lastPayoutDate = new Date();

      // Update earnings history status for included earnings
      for (let earning of payout.includedEarnings) {
        const earningRecord = affiliate.earningsHistory.id(earning.earningId);
        if (earningRecord) {
          earningRecord.status = 'paid';
          earningRecord.paidAt = new Date();
        }
      }

      await affiliate.save();
    }

    // If reverting from completed status, reverse the balance updates
    if (oldStatus === 'completed' && status !== 'completed') {
      const affiliate = await Affiliate.findById(payout.affiliate._id);
      if (affiliate) {
        // Reverse the earnings update
        affiliate.paidEarnings -= payout.amount;
        affiliate.pendingEarnings += payout.amount;

        // Revert earnings history status
        for (let earning of payout.includedEarnings) {
          const earningRecord = affiliate.earningsHistory.id(earning.earningId);
          if (earningRecord) {
            earningRecord.status = 'pending';
            earningRecord.paidAt = null;
          }
        }

        await affiliate.save();
      }
    }

    // Update the payout status
    await payout.updateStatus(status, notes, processedBy);

    // Get updated payout
    const updatedPayout = await Payout.findById(id)
      .populate('affiliate', 'firstName lastName email affiliateCode')
      .populate('processedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: `Payout status updated from ${oldStatus} to ${status}`,
      payout: updatedPayout,
      changes: {
        oldStatus,
        newStatus: status,
        balanceUpdated: status === 'completed' || oldStatus === 'completed'
      }
    });

  } catch (error) {
    console.error("Update payout status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

// Bulk update payout statuses (Admin only)
Affiliateroute.put("/admin/payouts/bulk-status", async (req, res) => {
  try {
    const { payoutIds, status, notes, processedBy } = req.body;

    // Validate required fields
    if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "payoutIds array is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Valid status values
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, processing, completed, failed, cancelled, on_hold"
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each payout
    for (let payoutId of payoutIds) {
      try {
        const payout = await Payout.findById(payoutId).populate('affiliate');
        
        if (!payout) {
          results.failed.push({
            payoutId,
            error: "Payout not found"
          });
          continue;
        }

        const oldStatus = payout.status;

        // Handle balance updates for completed status
        if (status === 'completed' && oldStatus !== 'completed') {
          const affiliate = await Affiliate.findById(payout.affiliate._id);
          if (affiliate) {
            affiliate.paidEarnings += payout.amount;
            affiliate.pendingEarnings -= payout.amount;
            affiliate.lastPayoutDate = new Date();

            // Update earnings history status
            for (let earning of payout.includedEarnings) {
              const earningRecord = affiliate.earningsHistory.id(earning.earningId);
              if (earningRecord) {
                earningRecord.status = 'paid';
                earningRecord.paidAt = new Date();
              }
            }

            await affiliate.save();
          }
        }

        // Update payout status
        await payout.updateStatus(status, notes, processedBy);

        results.successful.push({
          payoutId,
          oldStatus,
          newStatus: status,
          amount: payout.amount
        });

      } catch (error) {
        results.failed.push({
          payoutId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk status update completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    });

  } catch (error) {
    console.error("Bulk update payout status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});
module.exports = Affiliateroute;