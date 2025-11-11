const express = require("express");
const bcrypt = require("bcryptjs");
const Authrouter = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const Affiliate = require("../models/Affiliate");
const mongoose = require("mongoose");

// JWT Secret Keys
const JWT_SECRET = process.env.JWT_SECRET || "fsdfsdfsd43534";
const AFFILIATE_JWT_SECRET = process.env.AFFILIATE_JWT_SECRET || "dfsdfsdf535345";

// Function to generate a random player ID
const generatePlayerId = () => {
  const prefix = "PID";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${randomNum}`;
};

// Helper function to get device info
const getDeviceInfo = (userAgent) => {
  let deviceType = 'unknown';
  let browser = 'unknown';
  let os = 'unknown';
  
  if (userAgent.includes('Mobile')) deviceType = 'mobile';
  else if (userAgent.includes('Tablet')) deviceType = 'tablet';
  else deviceType = 'desktop';
  
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
};

// Import models
const LoginLog = require('../models/LoginLog');
const MasterAffiliate = require("../models/MasterAffiliate");

// Try to import ClickTrack, but handle if it doesn't exist
let ClickTrack;
try {
  ClickTrack = require('../models/ClickTrack');
} catch (error) {
  console.log('ClickTrack model not found, creating simplified version...');
  ClickTrack = {
    findOne: () => Promise.resolve(null),
    findOneAndUpdate: () => Promise.resolve(null),
    prototype: {
      save: () => Promise.resolve()
    }
  };
}

// Helper function to validate payment details
const validatePaymentDetails = (paymentMethod, paymentData) => {
  switch (paymentMethod) {
    case 'bkash':
    case 'nagad':
    case 'rocket':
      if (!paymentData.phoneNumber) {
        return { isValid: false, message: `${paymentMethod} phone number is required` };
      }
      const phoneRegex = /^01[3-9]\d{8}$/;
      if (!phoneRegex.test(paymentData.phoneNumber)) {
        return { isValid: false, message: `Invalid ${paymentMethod} phone number format. Use Bangladeshi format: 01XXXXXXXXX` };
      }
      break;

    case 'binance':
      if (!paymentData.email) {
        return { isValid: false, message: 'Binance email is required' };
      }
      if (!paymentData.walletAddress) {
        return { isValid: false, message: 'Binance wallet address is required' };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paymentData.email)) {
        return { isValid: false, message: 'Invalid Binance email format' };
      }
      break;

    default:
      return { isValid: false, message: 'Invalid payment method' };
  }
  return { isValid: true };
};

// Affiliate Registration Route
Authrouter.post("/affiliate/register", async (req, res) => {
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
      paymentDetails // This should be the specific payment details for the selected method
    } = req.body;

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

    // Validate payment method and details based on selected method
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
        
        default:
          return res.status(400).json({
            success: false,
            message: "Please select a valid payment method"
          });
      }
    }

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({ 
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

    // Prepare payment details for database (match the Mongoose schema structure)
    const dbPaymentDetails = {};
    if (paymentMethod && paymentDetails) {
      // Initialize the payment method object
      dbPaymentDetails[paymentMethod] = paymentDetails;
      
      // Set default accountType for mobile payment methods if not provided
      if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
        if (!dbPaymentDetails[paymentMethod].accountType) {
          dbPaymentDetails[paymentMethod].accountType = 'personal';
        }
      }
    }

    // Create new affiliate
    const affiliate = new Affiliate({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      company: company || '',
      website: website || '',
      promoMethod: promoMethod || 'other',
      paymentMethod: paymentMethod || 'bkash',
      paymentDetails: dbPaymentDetails,
      status: 'pending',
      verificationStatus: 'unverified'
    });

    await affiliate.save();

    res.status(201).json({
      success: true,
      message: "Affiliate registered successfully. Please wait for admin approval.",
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Affiliate with this email or phone already exists"
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
      message: "Internal server error during registration"
    });
  }
});

// Affiliate login
Authrouter.post("/affiliate/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const affiliate = await Affiliate.findOne({ email: email.toLowerCase() });
    if (!affiliate) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (affiliate.status !== 'active') {
      return res.json({
        success: false,
        message: `Your account is ${affiliate.status}. Please wait for admin approval before logging in.`
      });
    }

    const isPasswordValid = await affiliate.comparePassword(password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }

    affiliate.lastLogin = new Date();
    await affiliate.save();

    const token = jwt.sign(
      { affiliateId: affiliate._id, email: affiliate.email },
      AFFILIATE_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        affiliateCode: affiliate.affiliateCode,
        status: affiliate.status,
        verificationStatus: affiliate.verificationStatus,
        lastLogin: affiliate.lastLogin
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});
// Master Affiliate Login Route
Authrouter.post("/master-affiliate/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find affiliate with master_affiliate role
    const masterAffiliate = await MasterAffiliate.findOne({ 
      email: email.toLowerCase(),
      role: 'master_affiliate'
    });

    if (!masterAffiliate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if master affiliate account is active
    if (masterAffiliate.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your master affiliate account is ${masterAffiliate.status}. Please contact admin or your super affiliate for activation.`
      });
    }

    // Verify password
    const isPasswordValid = await masterAffiliate.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    masterAffiliate.lastLogin = new Date();
    await masterAffiliate.save();

    // Generate master affiliate specific JWT token
    const token = jwt.sign(
      { 
        masterAffiliateId: masterAffiliate._id, 
        email: masterAffiliate.email,
        role: 'master_affiliate',
        createdBy: masterAffiliate.createdBy
      },
      AFFILIATE_JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: "Master affiliate login successful",
      token,
      masterAffiliate: {
        id: masterAffiliate._id,
        email: masterAffiliate.email,
        firstName: masterAffiliate.firstName,
        lastName: masterAffiliate.lastName,
        fullName: masterAffiliate.fullName,
        affiliateCode: masterAffiliate.affiliateCode,
        role: masterAffiliate.role,
        status: masterAffiliate.status,
        verificationStatus: masterAffiliate.verificationStatus,
        commissionRate: masterAffiliate.commissionRate,
        depositRate: masterAffiliate.depositRate,
        totalEarnings: masterAffiliate.totalEarnings,
        pendingEarnings: masterAffiliate.pendingEarnings,
        paidEarnings: masterAffiliate.paidEarnings,
        referralCount: masterAffiliate.referralCount,
        lastLogin: masterAffiliate.lastLogin,
        createdBy: masterAffiliate.createdBy
      }
    });

  } catch (error) {
    console.error("Master affiliate login error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({
        success: false,
        message: "Token generation error"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
});
// Check if affiliate referral code exists
Authrouter.get("/affiliate/check-referral/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Affiliate code is required"
      });
    }
    
    const affiliate = await Affiliate.findOne({ 
      affiliateCode: code.toUpperCase(),
      status: 'active'
    });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Invalid affiliate code"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Affiliate code is valid",
      affiliate: {
        name: affiliate.fullName,
        company: affiliate.company,
        affiliateCode: affiliate.affiliateCode
      }
    });
  } catch (error) {
    console.error("Check affiliate referral error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get affiliate profile
Authrouter.get("/affiliate/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required"
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const affiliate = await Affiliate.findById(decoded.affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found"
      });
    }

    res.json({
      success: true,
      affiliate: {
        id: affiliate._id,
        email: affiliate.email,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        fullName: affiliate.fullName,
        phone: affiliate.phone,
        company: affiliate.company,
        website: affiliate.website,
        affiliateCode: affiliate.affiliateCode,
        commissionRate: affiliate.commissionRate,
        totalEarnings: affiliate.totalEarnings,
        pendingEarnings: affiliate.pendingEarnings,
        paidEarnings: affiliate.paidEarnings,
        referralCount: affiliate.referralCount,
        clickCount: affiliate.clickCount,
        isActive: affiliate.isActive,
        isVerified: affiliate.isVerified,
        paymentMethod: affiliate.paymentMethod,
        minimumPayout: affiliate.minimumPayout,
        lastLogin: affiliate.lastLogin,
        createdAt: affiliate.createdAt
      }
    });
  } catch (error) {
    console.error("Get affiliate profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Check if regular user referral code exists
Authrouter.get("/check-referral/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required"
      });
    }
    
    const user = await User.findOne({ referralCode: code });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Referral code is valid",
      referrer: {
        username: user.username,
        player_id: user.player_id
      }
    });
  } catch (error) {
    console.error("Check referral error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Track affiliate click
Authrouter.post("/track-click", async (req, res) => {
  try {
    const { affiliateCode, source, campaign, medium, landingPage } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!affiliateCode) {
      return res.status(400).json({
        success: false,
        error: "Affiliate code is required"
      });
    }

    const affiliate = await Affiliate.findOne({
      affiliateCode: affiliateCode.toUpperCase(),
      status: 'active'
    });

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: "Invalid affiliate code"
      });
    }

    // Generate unique click ID
    const clickId = 'CLK' + Math.random().toString(36).substr(2, 12).toUpperCase();

    // Update affiliate's click count
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: { clickCount: 1 }
    });

    // Save click data to ClickTrack if available
    const clickData = new ClickTrack({
      affiliateId: affiliate._id,
      affiliateCode: affiliateCode.toUpperCase(),
      clickId,
      source: source || 'direct',
      campaign: campaign || 'general',
      medium: medium || 'referral',
      landingPage: landingPage || '/register',
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
    await clickData.save();

    // Set cookies for tracking (30 days)
    res.cookie('affiliate_ref', affiliateCode.toUpperCase(), {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.cookie('click_id', clickId, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: "Click tracked successfully",
      clickId,
      affiliate: {
        name: affiliate.fullName,
        code: affiliate.affiliateCode
      }
    });

  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Signup Route with Enhanced Affiliate Tracking
// Authrouter.post("/signup", async (req, res) => {
//   try {
//     const { currency, phone, username, password, confirmPassword, fullName, email, referralCode, affiliateCode } = req.body;
//     const ipAddress = req.ip || req.connection.remoteAddress;
//     const userAgent = req.get('User-Agent') || 'unknown';

//     // Validation checks
//     if (!phone || !username || !password || !confirmPassword) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Phone, username, password, and confirm password are required" 
//       });
//     }

//     if (!/^1[0-9]{9}$/.test(phone)) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Please enter a valid Bangladeshi phone number, starting with 1." 
//       });
//     }

//     if (!/^[a-z0-9_]+$/.test(username)) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Username can only contain lowercase letters, numbers, and underscores." 
//       });
//     }

//     if (username.length < 3) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Username must be at least 3 characters long." 
//       });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Password must be at least 6 characters long." 
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ 
//         success: false,
//         error: "Passwords do not match." 
//       });
//     }

//     // Check for affiliate referral (prioritize cookies, fallback to request body)
//     let affiliateReferral = null;
//     let referringAffiliate = null;
//     let clickId = null;
    
//     // Check cookies for affiliate tracking
//     const affiliateCodeFromCookie = req.cookies?.affiliate_ref;
//     const clickIdFromCookie = req.cookies?.click_id;
//     console.log("Affiliate tracking info:", { affiliateCodeFromCookie, clickIdFromCookie, affiliateCode });

//     // Use cookie-based affiliate code if available, otherwise use request body affiliateCode
//     const affiliateCodeToUse = affiliateCodeFromCookie || affiliateCode;

//     // Handle affiliate tracking
//     if (affiliateCodeToUse) {
//       referringAffiliate = await Mastera.findOne({
//         affiliateCode: affiliateCodeToUse.toUpperCase(),
//         status: 'active'
//       });

//       if (!referringAffiliate) {
//         console.log(`Invalid affiliate code: ${affiliateCodeToUse}`);
//       } else {
//         affiliateReferral = {
//           affiliateId: referringAffiliate._id,
//           affiliateCode: affiliateCodeToUse.toUpperCase(),
//           clickId: clickIdFromCookie || null
//         };
//       }
//     }

//     // Handle regular user referral (manual input)
//     let referredBy = null;
//     if (referralCode && !affiliateReferral) {
//       const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
//       if (!referrer) {
//         return res.status(400).json({ 
//           success: false,
//           error: "Invalid referral code" 
//         });
//       }
//       referredBy = referrer._id;
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({
//       $or: [{ username }, { phone: `+880${phone}` }, { email }]
//     });

//     if (existingUser) {
//       if (existingUser.username === username) {
//         return res.status(400).json({ 
//           success: false,
//           error: "Username already exists." 
//         });
//       }
//       if (existingUser.phone === `+880${phone}`) {
//         return res.status(400).json({ 
//           success: false,
//           error: "Phone number already registered." 
//         });
//       }
//       if (email && existingUser.email === email) {
//         return res.status(400).json({ 
//           success: false,
//           error: "Email already registered." 
//         });
//       }
//     }

//     // Generate a unique player_id
//     let player_id;
//     let isUnique = false;
    
//     while (!isUnique) {
//       player_id = 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
//       const existingPlayer = await User.findOne({ player_id });
//       if (!existingPlayer) {
//         isUnique = true;
//       }
//     }

//     // Create registration source tracking
//     const registrationSource = {
//       type: affiliateReferral ? 'affiliate_referral' : referredBy ? 'user_referral' : 'direct',
//       source: 'website',
//       medium: 'organic',
//       campaign: 'signup',
//       clickId: clickIdFromCookie,
//       affiliateCode: affiliateReferral?.affiliateCode,
//       userReferralCode: referralCode,
//       landingPage: '/register',
//       ipAddress,
//       userAgent,
//       timestamp: new Date()
//     };

//     // Create new user
//     const newUser = new User({
//       currency: currency || "BDT",
//       phone: `+880${phone}`,
//       username,
//       password,
//       fullName,
//       email: email || null,
//       player_id,
//       referredBy,
//       registrationSource,
//       affiliateReferral: affiliateReferral ? {
//         affiliateId: affiliateReferral.affiliateId,
//         affiliateCode: affiliateReferral.affiliateCode,
//         clickId: affiliateReferral.clickId
//       } : undefined
//     });

//     await newUser.save();

//     // Handle affiliate conversion if applicable - USING NEW EARNINGS HISTORY SYSTEM
//     if (affiliateReferral && referringAffiliate) {
//       const commissionAmount = 500; // Fixed 500 taka per successful signup
//       const registrationId = newUser._id;
      
//       try {
//         // Use the new addRegistrationBonus method
//         await referringAffiliate.addRegistrationBonus(
//           newUser._id,           // referredUser
//           registrationId,         // registrationId
//           commissionAmount,       // bonusAmount
//           'New user registration bonus', // description
//           {
//             registrationSource: 'website',
//             clickId: clickIdFromCookie,
//             ipAddress: ipAddress,
//             userAgent: userAgent,
//             campaign: 'signup'
//           }
//         );

//         // Track the click conversion
//         await referringAffiliate.trackClick();

//         console.log(`Affiliate conversion recorded: ${affiliateReferral.affiliateCode} earned ${commissionAmount} taka for registration`);

//       } catch (affiliateError) {
//         console.error('Error recording affiliate commission:', affiliateError);
//         // Don't fail the user registration if affiliate tracking fails
//       }
//     }

//     // Update regular user referrer's count if applicable
//     if (referredBy) {
//       try {
//         await User.findByIdAndUpdate(referredBy, {
//           $inc: { 
//             referralCount: 1,
//             referralEarnings: 50 // Example: 50 taka bonus for regular referral
//           },
//           $push: {
//             referralUsers: {
//               user: newUser._id,
//               joinedAt: new Date(),
//               earnedAmount: 50
//             }
//           }
//         });

//         // Add bonus to referrer's account
//         await User.findByIdAndUpdate(referredBy, {
//           $inc: { balance: 50 }
//         });

//         console.log(`User referral recorded: ${referredBy} earned 50 taka for referral`);

//       } catch (referralError) {
//         console.error('Error recording user referral:', referralError);
//         // Don't fail the user registration if referral tracking fails
//       }
//     }

//     // Update login information for the new user
//     newUser.login_count = 1;
//     newUser.last_login = new Date();
//     newUser.first_login = false;
//     await newUser.save();

//     // Create a login log entry
//     const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
//     const loginLog = new LoginLog({
//       userId: newUser._id,
//       username: newUser.username,
//       ipAddress,
//       userAgent,
//       deviceType,
//       browser,
//       os,
//       status: 'success',
//       failureReason: null
//     });
    
//     await loginLog.save();

//     // Clear affiliate cookies after successful registration
//     res.clearCookie('affiliate_ref');
//     res.clearCookie('click_id');

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: newUser._id, username: newUser.username },
//       JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Return success response with token
//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       token,
//       user: {
//         id: newUser._id,
//         player_id: newUser.player_id,
//         username: newUser.username,
//         email: newUser.email,
//         phone: newUser.phone,
//         currency: newUser.currency,
//         balance: newUser.balance,
//         referralCode: newUser.referralCode,
//         first_login: newUser.first_login,
//         login_count: newUser.login_count,
//         last_login: newUser.last_login,
//         isAffiliateReferred: !!affiliateReferral,
//         isUserReferred: !!referredBy,
//         affiliateCode: affiliateReferral?.affiliateCode
//       }
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ 
//       success: false,
//       error: "Internal server error" 
//     });
//   }
// });
Authrouter.post("/signup", async (req, res) => {
    try {
      const { currency, phone, username, password, confirmPassword, fullName, email, referralCode, affiliateCode } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'unknown';

      // Validation checks
      if (!phone || !username || !password || !confirmPassword) {
        return res.status(400).json({ 
          success: false,
          error: "Phone, username, password, and confirm password are required" 
        });
      }

      if (!/^1[0-9]{9}$/.test(phone)) {
        return res.status(400).json({ 
          success: false,
          error: "Please enter a valid Bangladeshi phone number, starting with 1." 
        });
      }

      if (!/^[a-z0-9_]+$/.test(username)) {
        return res.status(400).json({ 
          success: false,
          error: "Username can only contain lowercase letters, numbers, and underscores." 
        });
      }

      if (username.length < 3) {
        return res.status(400).json({ 
          success: false,
          error: "Username must be at least 3 characters long." 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: "Password must be at least 6 characters long." 
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ 
          success: false,
          error: "Passwords do not match." 
        });
      }

      // Handle regular user referral (manual input)
      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
          return res.status(400).json({ 
            success: false,
            error: "Invalid referral code" 
          });
        }
        referredBy = referrer._id;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { phone: `+880${phone}` }, { email }]
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ 
            success: false,
            error: "Username already exists." 
          });
        }
        if (existingUser.phone === `+880${phone}`) {
          return res.status(400).json({ 
            success: false,
            error: "Phone number already registered." 
          });
        }
        if (email && existingUser.email === email) {
          return res.status(400).json({ 
            success: false,
            error: "Email already registered." 
          });
        }
      }

      // Generate a unique player_id
      let player_id;
      let isUnique = false;
      
      while (!isUnique) {
        player_id = 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
        const existingPlayer = await User.findOne({ player_id });
        if (!existingPlayer) {
          isUnique = true;
        }
      }

      // Create registration source tracking
      const registrationSource = {
        type: referredBy ? 'user_referral' : affiliateCode ? 'affiliate_referral' : 'direct',
        source: 'website',
        medium: 'organic',
        campaign: 'signup',
        userReferralCode: referralCode,
        affiliateCode: affiliateCode,
        landingPage: '/register',
        ipAddress,
        userAgent,
        timestamp: new Date()
      };

      // Create new user
      const newUser = new User({
        currency: currency || "BDT",
        phone: `+880${phone}`,
        username,
        password,
        fullName,
        email: email || null,
        player_id,
        referredBy,
        registrationSource
      });

      await newUser.save();

      // ------------------affiliate-part-----------------------
      let affiliateId = null;
      if (affiliateCode) {
        // Find the master affiliate
        const masterAffiliate = await MasterAffiliate.findOne({ 
          masterCode: affiliateCode.toUpperCase(),
          status: 'active' 
        });

        if (!masterAffiliate) {
          return res.status(400).json({ 
            success: false,
            error: "Invalid affiliate code" 
          });
        }

        // Find the affiliate who created this master affiliate
        const affiliate = await Affiliate.findOne({ 
          _id: masterAffiliate.createdBy,
          status: 'active' 
        });

        if (affiliate) {
          affiliateId = affiliate._id;
          
          // Ensure CPA rate is a valid number
          const registrationBonus = Number(affiliate.cpaRate) || 0;
          
          // Add registration bonus to affiliate
          const affiliateEarning = await affiliate.addRegistrationBonus(
            newUser._id,
            newUser._id, // Using user ID as registration ID
            registrationBonus,
            'New user registration bonus',
            { currency: 'BDT' }
          );

          // Update affiliate's referred users
          await Affiliate.findByIdAndUpdate(affiliate._id, {
            $inc: { referralCount: 1 },
            $push: {
              referredUsers: {
                user: newUser._id,
                joinedAt: new Date(),
                earnedAmount: registrationBonus,
                userStatus: 'active',
                lastActivity: new Date()
              }
            }
          });

          // Add override commission to master affiliate
          const overrideRate = Number(masterAffiliate.masterEarnings.overrideCommission) / 100 || 0;
          const overrideAmount = Number(masterAffiliate.cpaRate) || 0;
          
          console.log("Master Affiliate CPA Rate:", overrideAmount);

          // Ensure total_earning is a valid number before incrementing
          const currentTotalEarning = Number(masterAffiliate.total_earning) || 0;
          masterAffiliate.total_earning = currentTotalEarning + overrideAmount;
          
          await masterAffiliate.addOverrideCommission(
            overrideAmount,
            affiliate._id,
            'registration',
            registrationBonus,
            overrideRate,
            'Override commission from affiliate registration bonus',
            { subAffiliateEarningId: affiliateEarning.earningsHistory[affiliateEarning.earningsHistory.length - 1]._id }
          );
          
          await masterAffiliate.save();
          console.log(`Affiliate commission recorded: Affiliate ${affiliate._id} earned ${registrationBonus} BDT`);
          console.log(`Master affiliate commission recorded: Master ${masterAffiliate._id} earned ${overrideAmount} BDT`);
        } else {
          console.log(`No active affiliate found for master affiliate ${masterAffiliate._id}. Skipping affiliate commission.`);
        }
      }

      // Update regular user referrer's count if applicable
      if (referredBy) {
        try {
          await User.findByIdAndUpdate(referredBy, {
            $inc: { 
              referralCount: 1,
              referralEarnings: 50 // Example: 50 taka bonus for regular referral
            },
            $push: {
              referralUsers: {
                user: newUser._id,
                joinedAt: new Date(),
                earnedAmount: 50
              }
            }
          });

          // Add bonus to referrer's account
          await User.findByIdAndUpdate(referredBy, {
            $inc: { balance: 50 }
          });

          console.log(`User referral recorded: ${referredBy} earned 50 taka for referral`);

        } catch (referralError) {
          console.error('Error recording user referral:', referralError);
          // Don't fail the user registration if referral tracking fails
        }
      }

      // Update login information for the new user
      newUser.login_count = 1;
      newUser.last_login = new Date();
      newUser.first_login = false;
      await newUser.save();

      // Create a login log entry
      const { deviceType, browser, os } = getDeviceInfo(userAgent);
      
      const loginLog = new LoginLog({
        userId: newUser._id,
        username: newUser.username,
        ipAddress,
        userAgent,
        deviceType,
        browser,
        os,
        status: 'success',
        failureReason: null
      });
      
      await loginLog.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Return success response with token
      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: newUser._id,
          player_id: newUser.player_id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          currency: newUser.currency,
          balance: newUser.balance,
          referralCode: newUser.referralCode,
          affiliateId: affiliateId,
          first_login: newUser.first_login,
          login_count: newUser.login_count,
          last_login: newUser.last_login,
          isUserReferred: !!referredBy,
          isAffiliateReferred: !!affiliateId
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });


// Get referral statistics
Authrouter.get("/referral-stats", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const stats = {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      referralUsers: user.referralUsers.length,
      referralLink: `${process.env.FRONTEND_URL || 'https://your-site.com'}/register?ref=${user.referralCode}`
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Get affiliate statistics
Authrouter.get("/affiliate-stats", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied"
      });
    }

    const decoded = jwt.verify(token, AFFILIATE_JWT_SECRET);
    const affiliate = await Affiliate.findById(decoded.affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: "Affiliate not found"
      });
    }

    const stats = {
      affiliateCode: affiliate.affiliateCode,
      customAffiliateCode: affiliate.customAffiliateCode,
      totalEarnings: affiliate.totalEarnings,
      pendingEarnings: affiliate.pendingEarnings,
      paidEarnings: affiliate.paidEarnings,
      referralCount: affiliate.referralCount,
      clickCount: affiliate.clickCount,
      conversionRate: affiliate.clickCount > 0 ? (affiliate.referralCount / affiliate.clickCount * 100).toFixed(2) : 0,
      commissionRate: (affiliate.commissionRate * 100).toFixed(1) + '%',
      referralLinks: {
        main: `${process.env.FRONTEND_URL || 'https://your-site.com'}/register?aff=${affiliate.affiliateCode}`,
        deposit: `${process.env.FRONTEND_URL || 'https://your-site.com'}/deposit?aff=${affiliate.affiliateCode}`,
        sports: `${process.env.FRONTEND_URL || 'https://your-site.com'}/sports?aff=${affiliate.affiliateCode}`
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Affiliate stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Login route
Authrouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username }).select("+password");
    
    const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
    const loginLog = new LoginLog({
      userId: user ? user._id : null,
      username,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      os,
      status: user ? 'success' : 'failed',
      failureReason: user ? null : 'user_not_found'
    });
    
    await loginLog.save();

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      loginLog.status = 'failed';
      loginLog.failureReason = 'invalid_password';
      await loginLog.save();
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.login_count += 1;
    user.last_login = new Date();
    if (user.first_login) {
      user.first_login = false;
    }
    
    user.loginHistory.push({
      ipAddress,
      device: deviceType,
      userAgent,
      location: 'Unknown',
      timestamp: new Date()
    });
    
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }
    
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      success: true,
      token,
      user: {
        id: user._id,
        player_id: user.player_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        balance: user.balance,
        first_login: user.first_login,
        referralCode: user.referralCode,
        isAffiliateReferred: !!user.affiliateReferral
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = Authrouter;