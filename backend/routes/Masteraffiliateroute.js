const express = require("express");
const Masteraffiliateroute = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MasterAffiliate = require("../models/MasterAffiliate");
const Payout = require("../models/Payout");

// Middleware to parse JSON bodies
Masteraffiliateroute.use(express.json());

// Use the same JWT secret as in your auth routes
const AFFILIATE_JWT_SECRET = process.env.AFFILIATE_JWT_SECRET || "dfsdfsdf535345";

// Authentication middleware for master affiliate routes
const authenticateMasterAffiliate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const masterAffiliate = await MasterAffiliate.findById(decoded.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Master Affiliate not found."
      });
    }
    if (masterAffiliate.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support."
      });
    }
    req.masterAffiliate = masterAffiliate;
    req.masterAffiliateId = masterAffiliate._id;
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

// Get referred users (sub-affiliates)
Masteraffiliateroute.get("/referred-users", authenticateMasterAffiliate, async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId)
      .populate('subAffiliates.affiliate', 'firstName lastName email phone address.country createdAt lastLogin totalEarnings totalDeposits totalBets status');
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    const subAffiliates = masterAffiliate.subAffiliates.map(sub => ({
      _id: sub.affiliate._id,
      firstName: sub.affiliate.firstName,
      lastName: sub.affiliate.lastName,
      email: sub.affiliate.email,
      phone: sub.affiliate.phone,
      address: {
        country: sub.affiliate.address?.country
      },
      joinedAt: sub.joinedAt,
      lastLogin: sub.affiliate.lastLogin,
      totalEarned: sub.totalEarned,
      totalDeposits: sub.affiliate.totalDeposits || 0,
      totalBets: sub.affiliate.totalBets || 0,
      status: sub.status,
      customCommissionRate: sub.customCommissionRate,
      customDepositRate: sub.customDepositRate,
      lastActivity: sub.lastActivity
    }));

    res.json({
      success: true,
      referredUsers: subAffiliates,
      totalSubAffiliates: masterAffiliate.totalSubAffiliates,
      activeSubAffiliates: masterAffiliate.activeSubAffiliates
    });
  } catch (error) {
    console.error("Get referred users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Add sub-affiliate
Masteraffiliateroute.post("/sub-affiliates", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { affiliateId, customCommissionRate, customDepositRate } = req.body;
    
    if (!affiliateId) {
      return res.status(400).json({
        success: false,
        message: "Affiliate ID is required"
      });
    }

    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    await masterAffiliate.addSubAffiliate(affiliateId, customCommissionRate, customDepositRate);
    
    res.json({
      success: true,
      message: "Sub-affiliate added successfully"
    });
  } catch (error) {
    console.error("Add sub-affiliate error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Remove sub-affiliate
Masteraffiliateroute.delete("/sub-affiliates/:affiliateId", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    await masterAffiliate.removeSubAffiliate(affiliateId);
    
    res.json({
      success: true,
      message: "Sub-affiliate removed successfully"
    });
  } catch (error) {
    console.error("Remove sub-affiliate error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update sub-affiliate settings
Masteraffiliateroute.put("/sub-affiliates/:affiliateId", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { customCommissionRate, customDepositRate, status } = req.body;
    
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    const subAffiliate = masterAffiliate.subAffiliates.find(
      sub => sub.affiliate.toString() === affiliateId
    );

    if (!subAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Sub-affiliate not found"
      });
    }

    if (customCommissionRate !== undefined) {
      if (customCommissionRate < 0 || customCommissionRate > 100) {
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 0 and 100"
        });
      }
      subAffiliate.customCommissionRate = customCommissionRate;
    }

    if (customDepositRate !== undefined) {
      if (customDepositRate < 0 || customDepositRate > 100) {
        return res.status(400).json({
          success: false,
          message: "Deposit rate must be between 0 and 100"
        });
      }
      subAffiliate.customDepositRate = customDepositRate;
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      subAffiliate.status = status;
    }

    subAffiliate.lastActivity = new Date();
    await masterAffiliate.save();

    res.json({
      success: true,
      message: "Sub-affiliate updated successfully"
    });
  } catch (error) {
    console.error("Update sub-affiliate error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Forgot password - request reset
Masteraffiliateroute.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    const masterAffiliate = await MasterAffiliate.findOne({ email: email.toLowerCase() });
    if (!masterAffiliate) {
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent"
      });
    }
    await masterAffiliate.generateResetToken();
    res.json({
      success: true,
      message: "Password reset instructions sent to your email"
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
Masteraffiliateroute.post("/reset-password", async (req, res) => {
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
    const masterAffiliate = await MasterAffiliate.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!masterAffiliate) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }
    masterAffiliate.password = newPassword;
    masterAffiliate.resetPasswordToken = undefined;
    masterAffiliate.resetPasswordExpires = undefined;
    await masterAffiliate.save();
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

// Get master affiliate profile
Masteraffiliateroute.get("/profile", authenticateMasterAffiliate, async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
    res.json({
      success: true,
      affiliate: {
        id: masterAffiliate._id,
        email: masterAffiliate.email,
        firstName: masterAffiliate.firstName,
        lastName: masterAffiliate.lastName,
        phone: masterAffiliate.phone,
        company: masterAffiliate.company,
        website: masterAffiliate.website,
        promoMethod: masterAffiliate.promoMethod,
        socialMediaProfiles: masterAffiliate.socialMediaProfiles,
        address: masterAffiliate.address,
        masterCode: masterAffiliate.masterCode,
        customMasterCode: masterAffiliate.customMasterCode,
        commissionRate: masterAffiliate.commissionRate,
        depositRate: masterAffiliate.depositRate,
        commissionType: masterAffiliate.commissionType,
        cpaRate: masterAffiliate.cpaRate,
        totalEarnings: masterAffiliate.masterEarnings.totalEarnings,
        pendingEarnings: masterAffiliate.masterEarnings.pendingEarnings,
        paidEarnings: masterAffiliate.masterEarnings.paidEarnings,
        overrideCommission: masterAffiliate.masterEarnings.overrideCommission,
        totalSubAffiliates: masterAffiliate.totalSubAffiliates,
        activeSubAffiliates: masterAffiliate.activeSubAffiliates,
        status: masterAffiliate.status,
        verificationStatus: masterAffiliate.verificationStatus,
        paymentMethod: masterAffiliate.paymentMethod,
        paymentDetails: masterAffiliate.paymentDetails,
        minimumPayout: masterAffiliate.minimumPayout,
        payoutSchedule: masterAffiliate.payoutSchedule,
        autoPayout: masterAffiliate.autoPayout,
        createdAt: masterAffiliate.createdAt,
        emailVerified: masterAffiliate.emailVerified
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

// Update master affiliate profile
Masteraffiliateroute.put("/profile", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      company, 
      website, 
      promoMethod, 
      address,
      socialMediaProfiles 
    } = req.body;
    
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
    
    if (firstName) masterAffiliate.firstName = firstName;
    if (lastName) masterAffiliate.lastName = lastName;
    
    if (phone) {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format"
        });
      }
      const existingMaster = await MasterAffiliate.findOne({
        phone,
        _id: { $ne: masterAffiliate._id }
      });
      if (existingMaster) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered"
        });
      }
      masterAffiliate.phone = phone;
    }
    
    if (company !== undefined) masterAffiliate.company = company;
    if (website !== undefined) masterAffiliate.website = website;
    if (promoMethod) masterAffiliate.promoMethod = promoMethod;
    if (address) masterAffiliate.address = { ...masterAffiliate.address, ...address };
    if (socialMediaProfiles) {
      masterAffiliate.socialMediaProfiles = { 
        ...masterAffiliate.socialMediaProfiles, 
        ...socialMediaProfiles 
      };
    }
    
    await masterAffiliate.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      affiliate: {
        id: masterAffiliate._id,
        firstName: masterAffiliate.firstName,
        lastName: masterAffiliate.lastName,
        phone: masterAffiliate.phone,
        company: masterAffiliate.company,
        website: masterAffiliate.website,
        promoMethod: masterAffiliate.promoMethod,
        address: masterAffiliate.address,
        socialMediaProfiles: masterAffiliate.socialMediaProfiles
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

// Update commission settings
Masteraffiliateroute.put("/profile/commission", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { commissionRate, depositRate, commissionType, cpaRate, overrideCommission } = req.body;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    if (commissionRate !== undefined) {
      if (commissionRate < 0 || commissionRate > 100) {
        return res.status(400).json({
          success: false,
          message: "Commission rate must be between 0 and 100"
        });
      }
      masterAffiliate.commissionRate = commissionRate;
    }

    if (depositRate !== undefined) {
      if (depositRate < 0 || depositRate > 100) {
        return res.status(400).json({
          success: false,
          message: "Deposit rate must be between 0 and 100"
        });
      }
      masterAffiliate.depositRate = depositRate;
    }

    if (commissionType && ['revenue_share', 'cpa', 'hybrid'].includes(commissionType)) {
      masterAffiliate.commissionType = commissionType;
    }

    if (cpaRate !== undefined) {
      if (cpaRate < 0) {
        return res.status(400).json({
          success: false,
          message: "CPA rate cannot be negative"
        });
      }
      masterAffiliate.cpaRate = cpaRate;
    }

    if (overrideCommission !== undefined) {
      if (overrideCommission < 0 || overrideCommission > 100) {
        return res.status(400).json({
          success: false,
          message: "Override commission must be between 0 and 100"
        });
      }
      masterAffiliate.masterEarnings.overrideCommission = overrideCommission;
    }

    await masterAffiliate.save();

    res.json({
      success: true,
      message: "Commission settings updated successfully",
      commissionSettings: {
        commissionRate: masterAffiliate.commissionRate,
        depositRate: masterAffiliate.depositRate,
        commissionType: masterAffiliate.commissionType,
        cpaRate: masterAffiliate.cpaRate,
        overrideCommission: masterAffiliate.masterEarnings.overrideCommission
      }
    });
  } catch (error) {
    console.error("Update commission settings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Update payment details
Masteraffiliateroute.put("/profile/payment", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { paymentMethod, paymentDetails, minimumPayout, payoutSchedule, autoPayout } = req.body;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
    
    const validPaymentMethods = ['bkash', 'nagad', 'rocket', 'binance', 'bank_transfer'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }
    
    if (paymentMethod) masterAffiliate.paymentMethod = paymentMethod;
    
    if (paymentDetails) {
      if (['bkash', 'nagad', 'rocket'].includes(masterAffiliate.paymentMethod)) {
        if (paymentDetails.phoneNumber) {
          const phoneRegex = /^01[3-9]\d{8}$/;
          if (!phoneRegex.test(paymentDetails.phoneNumber)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${masterAffiliate.paymentMethod} phone number format. Use Bangladeshi format: 01XXXXXXXXX`
            });
          }
          masterAffiliate.paymentDetails[masterAffiliate.paymentMethod] = {
            phoneNumber: paymentDetails.phoneNumber,
            accountType: paymentDetails.accountType || 'personal'
          };
        }
      } else if (masterAffiliate.paymentMethod === 'binance') {
        if (paymentDetails.email || paymentDetails.walletAddress) {
          if (paymentDetails.email && !/\S+@\S+\.\S+/.test(paymentDetails.email)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid Binance email format'
            });
          }
          masterAffiliate.paymentDetails.binance = {
            email: paymentDetails.email || masterAffiliate.paymentDetails.binance?.email,
            walletAddress: paymentDetails.walletAddress || masterAffiliate.paymentDetails.binance?.walletAddress,
            binanceId: paymentDetails.binanceId || masterAffiliate.paymentDetails.binance?.binanceId
          };
        }
      } else if (masterAffiliate.paymentMethod === 'bank_transfer') {
        masterAffiliate.paymentDetails.bank_transfer = {
          bankName: paymentDetails.bankName || masterAffiliate.paymentDetails.bank_transfer?.bankName,
          accountName: paymentDetails.accountName || masterAffiliate.paymentDetails.bank_transfer?.accountName,
          accountNumber: paymentDetails.accountNumber || masterAffiliate.paymentDetails.bank_transfer?.accountNumber,
          branchName: paymentDetails.branchName || masterAffiliate.paymentDetails.bank_transfer?.branchName,
          routingNumber: paymentDetails.routingNumber || masterAffiliate.paymentDetails.bank_transfer?.routingNumber,
          swiftCode: paymentDetails.swiftCode || masterAffiliate.paymentDetails.bank_transfer?.swiftCode
        };
      }
    }

    if (minimumPayout !== undefined) {
      if (minimumPayout < 2000) {
        return res.status(400).json({
          success: false,
          message: "Minimum payout must be at least 2000"
        });
      }
      masterAffiliate.minimumPayout = minimumPayout;
    }

    if (payoutSchedule && ['weekly', 'bi_weekly', 'monthly', 'manual'].includes(payoutSchedule)) {
      masterAffiliate.payoutSchedule = payoutSchedule;
    }

    if (autoPayout !== undefined) {
      masterAffiliate.autoPayout = autoPayout;
    }

    await masterAffiliate.save();
    
    res.json({
      success: true,
      message: "Payment details updated successfully",
      paymentDetails: {
        paymentMethod: masterAffiliate.paymentMethod,
        formattedPaymentDetails: masterAffiliate.formattedPaymentDetails,
        minimumPayout: masterAffiliate.minimumPayout,
        payoutSchedule: masterAffiliate.payoutSchedule,
        autoPayout: masterAffiliate.autoPayout
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
Masteraffiliateroute.put("/profile/change-password", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId).select('+password');
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
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
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, masterAffiliate.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    masterAffiliate.password = newPassword;
    await masterAffiliate.save();
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

// Get dashboard stats
Masteraffiliateroute.get("/dashboard", authenticateMasterAffiliate, async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found",
      });
    }

    const performanceStats = masterAffiliate.getPerformanceStats();
    const monthlyGrowth = calculateMonthlyGrowth(masterAffiliate.earningsHistory);

    // Get recent earnings
    const recentEarnings = masterAffiliate.earningsHistory
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 10)
      .map(earning => ({
        id: earning._id,
        type: earning.type,
        description: earning.description,
        amount: earning.amount,
        status: earning.status,
        sourceType: earning.sourceType,
        earnedAt: earning.earnedAt,
      }));

    res.json({
      success: true,
      stats: {
        totalEarnings: masterAffiliate.masterEarnings.totalEarnings,
        pendingEarnings: masterAffiliate.masterEarnings.pendingEarnings,
        paidEarnings: masterAffiliate.masterEarnings.paidEarnings,
        earningsThisMonth: masterAffiliate.earningsThisMonth,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
        totalSubAffiliates: masterAffiliate.totalSubAffiliates,
        activeSubAffiliates: masterAffiliate.activeSubAffiliates,
        inactiveSubAffiliates: masterAffiliate.totalSubAffiliates - masterAffiliate.activeSubAffiliates,
        conversionRate: parseFloat(masterAffiliate.conversionRate.toFixed(2)),
        averageEarningPerSub: parseFloat(performanceStats.averageEarningPerSub.toFixed(2)),
        commissionRate: masterAffiliate.commissionRate,
        overrideCommission: masterAffiliate.cpaRate,
        availableForPayout: masterAffiliate.masterEarnings.pendingEarnings,
        canRequestPayout: masterAffiliate.masterEarnings.pendingEarnings >= masterAffiliate.minimumPayout,
        affiliateSince: masterAffiliate.createdAt,
        paymentMethod: masterAffiliate.paymentMethod,
      },
      recentEarnings
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
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
  
  const currentMonthEarnings = earningsHistory
    .filter(earning => {
      const earningDate = new Date(earning.earnedAt);
      return earningDate.getMonth() === currentMonth &&
             earningDate.getFullYear() === currentYear &&
             earning.status !== 'cancelled';
    })
    .reduce((total, earning) => total + earning.amount, 0);
  
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
// Get performance analytics for the Performance page
Masteraffiliateroute.get("/performance/analytics", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query; // week, month, quarter
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId)
      .populate('subAffiliates.affiliate', 'firstName lastName email totalEarnings totalDeposits totalBets clickCount referredUsers');

    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    // Determine date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();
    let days;

    switch (timeRange) {
      case 'week':
        days = 7;
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
        prevEndDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        days = 90;
        startDate.setDate(now.getDate() - 90);
        prevStartDate.setDate(now.getDate() - 180);
        prevEndDate.setDate(now.getDate() - 90);
        break;
      default: // month
        days = 30;
        startDate.setDate(now.getDate() - 30);
        prevStartDate.setDate(now.getDate() - 60);
        prevEndDate.setDate(now.getDate() - 30);
    }

    // Calculate overview metrics
    const filteredEarnings = masterAffiliate.earningsHistory.filter(
      earning => new Date(earning.earnedAt) >= startDate && earning.status !== 'cancelled'
    );

    const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const totalClicks = masterAffiliate.subAffiliates.reduce(
      (sum, sub) => sum + (sub.affiliate.clickCount || 0), 0
    );
    const totalConversions = masterAffiliate.subAffiliates.reduce(
      (sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0
    );
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const averageEarning = totalConversions > 0 ? totalEarnings / totalConversions : 0;
    const rank = calculateRank(totalEarnings);

    // Calculate trends
    const trends = generateTrendData(filteredEarnings, masterAffiliate.subAffiliates, timeRange, startDate, days);

    // Calculate metrics
    const metrics = generateMetrics(filteredEarnings, masterAffiliate.subAffiliates, totalEarnings);

    // Calculate comparisons
    const comparisons = calculateComparisons(masterAffiliate.earningsHistory, masterAffiliate.subAffiliates, timeRange, prevStartDate, prevEndDate);

    // Construct response
    const performanceData = {
      overview: {
        totalEarnings,
        totalClicks,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageEarning: parseFloat(averageEarning.toFixed(2)),
        rank
      },
      trends,
      metrics,
      comparisons
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

// Helper function to calculate rank (same as frontend)
function calculateRank(earnings) {
  if (earnings > 5000) return 1;
  if (earnings > 2500) return 5;
  if (earnings > 1000) return 15;
  if (earnings > 500) return 30;
  if (earnings > 100) return 45;
  return 50;
}

// Helper function to generate trend data
function generateTrendData(earningsHistory, subAffiliates, timeRange, startDate, days) {
  const earnings = Array(days).fill(0);
  const clicks = Array(days).fill(0);
  const conversions = Array(days).fill(0);
  const dates = [];

  // Generate dates
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  // Aggregate earnings
  earningsHistory.forEach(earning => {
    const earnedDate = new Date(earning.earnedAt);
    if (earnedDate >= startDate) {
      const dayIndex = Math.floor((earnedDate - startDate) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < days) {
        earnings[dayIndex] += earning.amount;
      }
    }
  });

  // Aggregate clicks and conversions from sub-affiliates
  subAffiliates.forEach(sub => {
    const clickCount = sub.affiliate.clickCount || 0;
    const conversionCount = sub.affiliate.referredUsers?.length || 0;
    const avgClicksPerDay = clickCount / days;
    const avgConversionsPerDay = conversionCount / days;

    for (let i = 0; i < days; i++) {
      clicks[i] += Math.floor(avgClicksPerDay * (0.8 + Math.random() * 0.4));
      conversions[i] += Math.floor(avgConversionsPerDay * (0.8 + Math.random() * 0.4));
    }
  });

  return { earnings, clicks, conversions, dates };
}

// Helper function to generate metrics
function generateMetrics(earningsHistory, subAffiliates, totalEarnings) {
  // Earnings by type
  const earningsByType = earningsHistory.reduce((acc, earning) => {
    if (!acc[earning.type]) {
      acc[earning.type] = 0;
    }
    acc[earning.type] += earning.amount;
    return acc;
  }, {});

  // Top performing links (simplified; adjust based on actual link data if available)
  const topPerformingLinks = [
    {
      name: 'Main Registration',
      clicks: subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.clickCount || 0), 0),
      conversions: subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0),
      earnings: earningsByType.override_commission || 0
    },
    {
      name: 'Sports Welcome Bonus',
      clicks: Math.floor(subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.clickCount || 0), 0) * 0.3),
      conversions: Math.floor(subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0) * 0.3),
      earnings: earningsByType.bonus || 0
    },
    {
      name: 'Deposit Page',
      clicks: Math.floor(subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.clickCount || 0), 0) * 0.2),
      conversions: Math.floor(subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0) * 0.2),
      earnings: earningsByType.incentive || 0
    }
  ].filter(link => link.clicks > 0);

  // Referral sources (simulated data)
  const totalConversions = subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0);
  const referralSources = [
    { source: 'Direct', percentage: 35, conversions: Math.floor(totalConversions * 0.35) },
    { source: 'Facebook', percentage: 25, conversions: Math.floor(totalConversions * 0.25) },
    { source: 'Google', percentage: 20, conversions: Math.floor(totalConversions * 0.20) },
    { source: 'Email', percentage: 12, conversions: Math.floor(totalConversions * 0.12) },
    { source: 'Other', percentage: 8, conversions: Math.floor(totalConversions * 0.08) }
  ];

  // Geographic data (simulated)
  const geographicData = [
    { country: 'Bangladesh', users: Math.floor(totalConversions * 0.6), earnings: (earningsByType.override_commission || 0) * 0.6 },
    { country: 'United States', users: Math.floor(totalConversions * 0.15), earnings: (earningsByType.override_commission || 0) * 0.15 },
    { country: 'United Kingdom', users: Math.floor(totalConversions * 0.10), earnings: (earningsByType.override_commission || 0) * 0.10 },
    { country: 'Canada', users: Math.floor(totalConversions * 0.08), earnings: (earningsByType.override_commission || 0) * 0.08 },
    { country: 'Australia', users: Math.floor(totalConversions * 0.07), earnings: (earningsByType.override_commission || 0) * 0.07 }
  ];

  // Hourly performance (simulated)
  const hourlyPerformance = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    clicks: Math.floor((subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.clickCount || 0), 0) / 30) * (0.5 + Math.random() * 1.0) / 24),
    conversions: Math.floor((totalConversions / 30) * (0.3 + Math.random() * 0.7) / 24),
    earnings: (totalEarnings / 30) * (0.4 + Math.random() * 0.8) / 24
  }));

  return {
    topPerformingLinks,
    referralSources,
    geographicData,
    hourlyPerformance,
    earningsByType: Object.entries(earningsByType).map(([type, amount]) => ({
      type: type.replace('_', ' ').toUpperCase(),
      amount,
      percentage: totalEarnings ? (amount / totalEarnings) * 100 : 0
    }))
  };
}

// Helper function to calculate comparisons
function calculateComparisons(earningsHistory, subAffiliates, timeRange, prevStartDate, prevEndDate) {
  const previousPeriodEarnings = earningsHistory
    .filter(earning => {
      const earnedDate = new Date(earning.earnedAt);
      return earnedDate >= prevStartDate && earnedDate <= prevEndDate && earning.status !== 'cancelled';
    })
    .reduce((total, earning) => total + earning.amount, 0);

  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
  const avgClicksPerDay = subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.clickCount || 0), 0) / days;
  const avgConversionsPerDay = subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.referredUsers?.length || 0), 0) / days;
  const previousPeriodClicks = Math.floor(avgClicksPerDay * days * (0.8 + Math.random() * 0.4));
  const previousPeriodConversions = Math.floor(avgConversionsPerDay * days * (0.8 + Math.random() * 0.4));

  return {
    previousPeriod: {
      earnings: previousPeriodEarnings,
      clicks: previousPeriodClicks,
      conversions: previousPeriodConversions
    },
    averageAffiliate: {
      earnings: previousPeriodEarnings * 0.8,
      conversionRate: subAffiliates.reduce((sum, sub) => sum + (sub.affiliate.conversionRate || 0), 0) / (subAffiliates.length || 1) * 0.9
    }
  };
}
// Get earnings history
Masteraffiliateroute.get("/earnings/history", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    let earnings = [...masterAffiliate.earningsHistory];

    // Apply filters
    if (type) {
      earnings = earnings.filter(earning => earning.type === type);
    }
    if (status) {
      earnings = earnings.filter(earning => earning.status === status);
    }
    if (startDate) {
      const start = new Date(startDate);
      earnings = earnings.filter(earning => new Date(earning.earnedAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      earnings = earnings.filter(earning => new Date(earning.earnedAt) <= end);
    }

    // Sort by date (newest first)
    earnings.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEarnings = earnings.slice(startIndex, endIndex);

    // Populate source affiliate information
    const populatedEarnings = await Promise.all(
      paginatedEarnings.map(async (earning) => {
        const populatedEarning = { ...earning.toObject() };
        if (earning.sourceAffiliate) {
          const sourceAffiliate = await MasterAffiliate.findById(earning.sourceAffiliate)
            .select('firstName lastName email masterCode');
          if (sourceAffiliate) {
            populatedEarning.sourceAffiliateInfo = {
              firstName: sourceAffiliate.firstName,
              lastName: sourceAffiliate.lastName,
              email: sourceAffiliate.email,
              masterCode: sourceAffiliate.masterCode
            };
          }
        }
        return populatedEarning;
      })
    );

    res.json({
      success: true,
      earnings: populatedEarnings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: earnings.length,
        pages: Math.ceil(earnings.length / limit)
      }
    });
  } catch (error) {
    console.error("Earnings history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Request payout
Masteraffiliateroute.post("/payout/request", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { amount } = req.body;
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
    
    const payoutAmount = amount || masterAffiliate.masterEarnings.pendingEarnings;
    
    if (payoutAmount < masterAffiliate.minimumPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ${masterAffiliate.minimumPayout}`
      });
    }
    
    if (payoutAmount > masterAffiliate.masterEarnings.pendingEarnings) {
      return res.status(400).json({
        success: false,
        message: "Insufficient pending earnings"
      });
    }
    
    if (!masterAffiliate.paymentMethod || !masterAffiliate.paymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Please set up your payment method before requesting payout"
      });
    }

    // Use the processPayout method from the model
    await masterAffiliate.processPayout(payoutAmount);
    
    res.json({
      success: true,
      message: "Payout request submitted successfully",
      payout: {
        amount: payoutAmount,
        status: 'completed',
        paymentMethod: masterAffiliate.paymentMethod,
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
Masteraffiliateroute.get("/payout/history", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const payouts = await Payout.find({ masterAffiliate: req.masterAffiliateId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Payout.countDocuments({ masterAffiliate: req.masterAffiliateId });
    
    res.json({
      success: true,
      payouts,
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

// Track referral click
Masteraffiliateroute.post("/track-click", async (req, res) => {
  try {
    const { masterCode } = req.body;
    if (!masterCode) {
      return res.status(400).json({
        success: false,
        message: "Master code is required"
      });
    }
    const masterAffiliate = await MasterAffiliate.findByCode(masterCode);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid master code"
      });
    }
    res.json({
      success: true,
      message: "Click tracked successfully",
      masterAffiliateId: masterAffiliate._id
    });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get referral links
Masteraffiliateroute.get("/referral-links", authenticateMasterAffiliate, async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }
    
    const baseUrl = process.env.BASE_URL || "https://your-betting-site.com";
    const referralCode = masterAffiliate.customMasterCode || masterAffiliate.masterCode;
    
    const referralLinks = {
      main: `${baseUrl}/register?ref=${referralCode}`,
      deposit: `${baseUrl}/deposit?ref=${referralCode}`,
      sportsbook: `${baseUrl}/sports?ref=${referralCode}`,
      casino: `${baseUrl}/casino?ref=${referralCode}`,
      masterAffiliate: `${baseUrl}/affiliate/register?master=${referralCode}`
    };
    
    res.json({
      success: true,
      referralLinks,
      masterCode: referralCode
    });
  } catch (error) {
    console.error("Referral links error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get performance analytics
Masteraffiliateroute.get("/analytics", authenticateMasterAffiliate, async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    const masterAffiliate = await MasterAffiliate.findById(req.masterAffiliateId);
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Master Affiliate not found"
      });
    }

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(now.getDate() - 30);
    }

    const filteredEarnings = masterAffiliate.earningsHistory.filter(earning => 
      new Date(earning.earnedAt) >= startDate && earning.status !== 'cancelled'
    );

    const earningsByType = filteredEarnings.reduce((acc, earning) => {
      acc[earning.type] = (acc[earning.type] || 0) + earning.amount;
      return acc;
    }, {});

    const earningsBySource = filteredEarnings.reduce((acc, earning) => {
      acc[earning.sourceType] = (acc[earning.sourceType] || 0) + earning.amount;
      return acc;
    }, {});

    const totalEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);

    res.json({
      success: true,
      analytics: {
        period,
        totalEarnings,
        earningsByType,
        earningsBySource,
        totalSubAffiliates: masterAffiliate.totalSubAffiliates,
        activeSubAffiliates: masterAffiliate.activeSubAffiliates,
        conversionRate: masterAffiliate.conversionRate,
        topPerformingSubs: masterAffiliate.subAffiliates
          .sort((a, b) => b.totalEarned - a.totalEarned)
          .slice(0, 5)
          .map(sub => ({
            affiliateId: sub.affiliate,
            totalEarned: sub.totalEarned,
            status: sub.status
          }))
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = Masteraffiliateroute;