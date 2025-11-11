const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Configuration
const SALT_WORK_FACTOR = 10;
const PASSWORD_MIN_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const BONUS_CONFIG = {
  BONUS_EXPIRY_DAYS: 30,
  FIRST_DEPOSIT_BONUS_RATE: 0.03,
  SPECIAL_BONUS_RATE: 1.5,
  WAGERING_REQUIREMENT: 30,
  DEPOSIT_WAGERING_REQUIREMENT: 3,
  MINIMUM_REMAINING_WAGER: 1,
  WITHDRAWAL_COMMISSION_RATE: 0.2,
  NEW_USER_ACCOUNT_AGE_DAYS: 3,
  MIN_DEPOSIT_AMOUNT: 100,
  MAX_DEPOSIT_AMOUNT: 30000,
  MIN_WITHDRAWAL_AMOUNT: 300,
  MAX_WITHDRAWALS_PER_DAY: 3,
  DAILY_WITHDRAWAL_LIMIT: 50000
};

// Click Tracking Schema
const clickTrackSchema = new Schema({
  clickId: {
    type: String,
    required: true,
    unique: true
  },
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  affiliateCode: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    default: 'direct'
  },
  campaign: {
    type: String,
    default: 'general'
  },
  medium: {
    type: String,
    default: 'referral'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  converted: {
    type: Boolean,
    default: false
  },
  convertedAt: Date,
  conversionValue: {
    type: Number,
    default: 0
  }
});

// Bonus Activity Log Schema
const bonusActivitySchema = new Schema({
    bonusType: {
        type: String,
        enum: ['first_deposit', 'special_bonus'],
        required: true
    },
    bonusAmount: {
        type: Number,
        required: true
    },
    depositAmount: {
        type: Number,
        required: true
    },
    activatedAt: {
        type: Date,
        default: Date.now
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    }
});

// Affiliate Referral Schema
const affiliateReferralSchema = new Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  affiliateCode: {
    type: String,
    required: true
  },
  clickId: {
    type: String,
    ref: 'ClickTrack'
  },
  commissionEarned: {
    type: Number,
    default: 0
  },
  commissionRate: {
    type: Number,
    default: 0.1
  },
  referredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'converted', 'expired'],
    default: 'active'
  }
});

// User Schema
const UserSchema = new Schema({
    // ========== BASIC INFORMATION ==========
// In your UserSchema, change the email field to:
    username: {
        type: String,
        unique: true,
        minlength: 4,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password: {
        type: String,
        required: function() { return !this.isOneClickUser; },
        select: false,
        minlength: PASSWORD_MIN_LENGTH
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        type: String,
        default: "https://images.5943920202.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png"
    },
    affiliateCode:{
      type: String,
    },
    // ========== ACCOUNT INFORMATION ==========
    player_id: {
        type: String,
        required: true,
        unique: true
    },
    isOneClickUser: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin', 'super_admin'],
        default: "user"
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'deactivated', 'pending'],
        default: 'active',
    },
    language: {
        type: String,
        enum: ['en', 'bn', 'hi', 'ar'],
        default: 'bn'
    },
    first_login: {
        type: Boolean,
        default: true
    },
    last_login: {
        type: Date
    },
    login_count: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    // ========== FINANCIAL INFORMATION ==========
    currency: {
        type: String,
        default: "BDT"
    },
    balance: {
        type: Number,
        default: 0,
    },
    bonusBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    total_deposit: {
        type: Number,
        default: 0,
        min: 0
    },
    total_withdraw: {
        type: Number,
        default: 0,
        min: 0
    },
    total_bet: {
        type: Number,
        default: 0,
        min: 0
    },
    total_wins: {
        type: Number,
        default: 0,
        min: 0
    },
    total_loss: {
        type: Number,
        default: 0,
        min: 0
    },
    net_profit: {
        type: Number,
        default: 0
    },
    lifetime_deposit:{
      type: Number,
      default: 0
    },
    lifetime_withdraw:{
        type: Number,
        default: 0
    },
    lifetime_bet:{
        type: Number,
        default: 0 
    },
    totalWagered: {
        type: Number,
        default: 0
    },
    dailyWithdrawalLimit: {
        type: Number,
        default: BONUS_CONFIG.DAILY_WITHDRAWAL_LIMIT
    },
    withdrawalCountToday: {
        type: Number,
        default: 0
    },
    lastWithdrawalDate: {
        type: Date
    },

    // ========== BONUS INFORMATION ==========
    bonusInfo: {
        firstDepositBonusClaimed: {
            type: Boolean,
            default: false
        },
        activeBonuses: [{
            bonusType: {
                type: String,
                enum: ['first_deposit', 'special_bonus'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            originalAmount: {
                type: Number,
                required: true
            },
            wageringRequirement: {
                type: Number,
                required: true,
                default: BONUS_CONFIG.WAGERING_REQUIREMENT
            },
            amountWagered: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                default: function() {
                    const date = new Date();
                    date.setDate(date.getDate() + BONUS_CONFIG.BONUS_EXPIRY_DAYS);
                    return date;
                }
            },
            status: {
                type: String,
                enum: ['active', 'completed', 'expired', 'cancelled'],
                default: 'active'
            }
        }],
        bonusWageringTotal: {
            type: Number,
            default: 0
        },
        cancelledBonuses: [{
            bonusType: String,
            amount: Number,
            penaltyApplied: Number,
            cancelledAt: Date
        }]
    },

    // ========== SECURITY ==========
    transactionPassword: {
        type: String,
        select: false
    },
    moneyTransferPassword: {
        type: String,
        select: false
    },
    isMoneyTransferPasswordSet: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date,
        purpose: String,
        verified: { type: Boolean, default: false }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    passwordHistory: [{
        password: String,
        changedAt: Date
    }],
    lastPasswordChange: Date,

    // ========== ACTIVITY TRACKING ==========
    loginHistory: [{
        ipAddress: String,
        device: String,
        userAgent: String,
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    deviceTokens: [{
        token: String,
        deviceType: String,
        lastUsed: Date
    }],

    // ========== PREFERENCES ==========
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    themePreference: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark'
    },

    // ========== VERIFICATION ==========
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    kycStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified'
    },
    kycDocuments: [{
        documentType: String,
        frontImage: String,
        backImage: String,
        status: String,
        submittedAt: Date,
        verifiedAt: Date
    }],

    // ========== REFERRAL SYSTEM ==========
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
  last_login: {
    type: Date,
    default: null
  },
    referralEarnings: {
        type: Number,
        default: 0
    },
    referralCount: {
        type: Number,
        default: 0
    },
    referralUsers: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        earnedAmount: {
            type: Number,
            default: 0
        }
    }],
    referralTracking: [{
        referralCodeUsed: String,
        referredUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // ========== AFFILIATE REFERRAL TRACKING ==========
    affiliateReferral: {
        type: affiliateReferralSchema,
        default: null
    },

    // ========== REGISTRATION SOURCE TRACKING ==========
    registrationSource: {
        type: {
            type: String,
            enum: ['direct', 'user_referral', 'affiliate_referral', 'organic', 'social', 'other'],
            default: 'direct'
        },
        source: String,
        medium: String,
        campaign: String,
        clickId: String,
        affiliateCode: String,
        landingPage: String,
        ipAddress: String,
        userAgent: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },

    // ========== TRANSACTION HISTORIES ==========
    // Adding the betHistory field to store betting records
    betHistory: [
        {
            betAmount: { type: Number, required: true },
            betResult: { type: String, enum: ['win', 'loss'], required: true },
            transaction_id: { type: String, required: true },
            game_id: { type: String, required: true },
            bet_time: { type: Date, required: true },
            status: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    profitLossHistory: [{
        type: { type: String, enum: ['profit', 'loss'], required: true },
        amount: Number,
        reason: String,
        date: { type: Date, default: Date.now }
    }],
    depositHistory: [{
        method: {
            type: String,
            enum: ['bkash', 'nagad', 'rocket', 'bank'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: BONUS_CONFIG.MIN_DEPOSIT_AMOUNT
        },
        status: { 
            type: String, 
            enum: ['pending', 'completed', 'failed', 'cancelled'], 
            default: 'pending' 
        },
        transactionId: String,
        bonusApplied: {
            type: Boolean,
            default: false
        },
        bonusType: {
            type: String,
            default: 'none'
        },
        bonusAmount: {
            type: Number,
            default: 0
        },
        orderId: String,
        paymentUrl: String,
        processedAt: Date,
        completedAt: Date,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    withdrawHistory: [{
        method: {
            type: String,
            enum: ['bkash', 'nagad', 'rocket', 'bank'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: BONUS_CONFIG.MIN_WITHDRAWAL_AMOUNT
        },
        netAmount: {
            type: Number,
            required: true
        },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'], 
            default: 'pending' 
        },
        accountNumber: {
            type: String,
            required: true
        },
        transactionId: String,
        orderId: String,
        bonusCancelled: {
            type: Boolean,
            default: false
        },
        bonusPenalty: {
            type: Number,
            default: 0
        },
        commissionApplied: {
            type: Boolean,
            default: false
        },
        commissionAmount: {
            type: Number,
            default: 0
        },
        processedAt: Date,
        completedAt: Date,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    transactionHistory: [{
        type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'bonus', 'bet', 'win', 'penalty', 'affiliate_commission'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        balanceBefore: {
            type: Number,
            required: true
        },
        balanceAfter: {
            type: Number,
            required: true
        },
        description: String,
        referenceId: String,
        affiliateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Affiliate'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    bonusActivityLogs: [bonusActivitySchema]  // Added field for bonus activity logs
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.transactionPassword;
            delete ret.moneyTransferPassword;
            delete ret.twoFactorSecret;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.otp;
            delete ret.passwordHistory;
            return ret;
        }
    }
});

// ========== VIRTUALS ==========
UserSchema.virtual('formattedBalance').get(function() {
    return this.balance;
});

UserSchema.virtual('accountAgeInDays').get(function() {
    return Math.floor((new Date() - new Date(this.createdAt)) / (1000 * 60 * 60 * 24));
});

UserSchema.virtual('isNewUser').get(function() {
    return this.accountAgeInDays < BONUS_CONFIG.NEW_USER_ACCOUNT_AGE_DAYS;
});

UserSchema.virtual('availableBalance').get(function() {
    let available = this.balance || 0;
    if (this.bonusBalance > 0) return 0;
    return available;
});

UserSchema.virtual('withdrawableAmount').get(function() {
    let amount = this.balance || 0;
    
    if (this.bonusBalance > 0) return 0;
    
    const requiredWager = this.total_deposit * BONUS_CONFIG.DEPOSIT_WAGERING_REQUIREMENT;
    const completedWager = this.totalWagered || 0;
    const remainingWager = Math.max(0, requiredWager - completedWager);
    const minRequired = this.total_deposit * BONUS_CONFIG.MINIMUM_REMAINING_WAGER;
    
    if (remainingWager > minRequired) {
        return amount * (1 - BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE);
    }
    
    return amount;
});

UserSchema.virtual('wageringStatus').get(function() {
    const required = this.total_deposit * BONUS_CONFIG.DEPOSIT_WAGERING_REQUIREMENT;
    const completed = this.totalWagered || 0;
    const remaining = Math.max(0, required - completed);
    const minRequired = this.total_deposit * BONUS_CONFIG.MINIMUM_REMAINING_WAGER;
    
    return {
        required,
        completed,
        remaining,
        minRequired,
        isCompleted: remaining <= minRequired,
        commissionRate: remaining > minRequired ? BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE : 0
    };
});

UserSchema.virtual('isAffiliateReferred').get(function() {
    return !!this.affiliateReferral;
});

// ========== PRE-SAVE HOOKS ==========
UserSchema.pre('save', async function(next) {
    if (!this.player_id) {
        this.player_id = 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    if (!this.referralCode) {
        this.referralCode = 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.password = await bcrypt.hash(this.password, salt);
        
        if (this.passwordHistory) {
            this.passwordHistory.push({
                password: this.password,
                changedAt: new Date()
            });
        } else {
            this.passwordHistory = [{
                password: this.password,
                changedAt: new Date()
            }];
        }
        
        if (this.passwordHistory.length > 5) {
            this.passwordHistory = this.passwordHistory.slice(-5);
        }
        
        this.lastPasswordChange = new Date();
    }

    if (this.isModified('transactionPassword')) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.transactionPassword = await bcrypt.hash(this.transactionPassword, salt);
    }

    if (this.isModified('moneyTransferPassword')) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        this.moneyTransferPassword = await bcrypt.hash(this.moneyTransferPassword, salt);
        this.isMoneyTransferPasswordSet = true;
    }

    if (this.isModified('lastWithdrawalDate')) {
        const today = new Date().toDateString();
        const lastWithdrawalDay = this.lastWithdrawalDate ? new Date(this.lastWithdrawalDate).toDateString() : null;
        
        if (!lastWithdrawalDay || today !== lastWithdrawalDay) {
            this.withdrawalCountToday = 0;
        }
    }

    next();
});

// ========== AFFILIATE TRACKING METHODS ==========
UserSchema.methods.trackAffiliateConversion = async function(affiliateId, affiliateCode, clickId = null) {
    const Affiliate = mongoose.model('Affiliate');
    const ClickTrack = mongoose.model('ClickTrack');
    
    // Find the affiliate
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
        throw new Error('Affiliate not found');
    }

    // Update click track if clickId is provided
    if (clickId) {
        await ClickTrack.findOneAndUpdate(
            { clickId, affiliate: affiliateId },
            { 
                converted: true,
                convertedAt: new Date()
            }
        );
    }

    // Set affiliate referral data
    this.affiliateReferral = {
        affiliateId,
        affiliateCode,
        clickId,
        commissionRate: affiliate.commissionRate || 0.1,
        referredAt: new Date(),
        status: 'active'
    };

    // Update registration source
    this.registrationSource = {
        type: 'affiliate_referral',
        source: 'affiliate',
        medium: 'referral',
        campaign: 'affiliate_program',
        clickId,
        affiliateCode,
        landingPage: '/register',
        ipAddress: this.registrationSource?.ipAddress,
        userAgent: this.registrationSource?.userAgent,
        timestamp: new Date()
    };

    await this.save();

    // Add user to affiliate's referred users
    await Affiliate.findByIdAndUpdate(affiliateId, {
        $push: {
            referredUsers: {
                user: this._id,
                joinedAt: new Date(),
                earnedAmount: 0,
                userStatus: 'active',
                lastActivity: new Date()
            }
        },
        $inc: {
            referralCount: 1,
            activeReferrals: 1
        }
    });

    return this;
};

UserSchema.methods.awardAffiliateCommission = async function(amount, transactionType = 'deposit') {
    if (!this.affiliateReferral) {
        return null;
    }

    const Affiliate = mongoose.model('Affiliate');
    const affiliate = await Affiliate.findById(this.affiliateReferral.affiliateId);
    
    if (!affiliate) {
        return null;
    }

    // Calculate commission based on transaction type
    let commissionRate = this.affiliateReferral.commissionRate;
    let commissionAmount = 0;

    switch (transactionType) {
        case 'deposit':
            commissionAmount = amount * commissionRate;
            break;
        case 'bet':
            commissionAmount = amount * (commissionRate * 0.1); // 10% of normal rate for bets
            break;
        case 'win':
            commissionAmount = amount * (commissionRate * 0.05); // 5% of normal rate for wins
            break;
        default:
            commissionAmount = amount * commissionRate;
    }

    if (commissionAmount <= 0) {
        return null;
    }

    // Update affiliate earnings
    await Affiliate.findByIdAndUpdate(affiliate._id, {
        $inc: {
            pendingEarnings: commissionAmount,
            totalEarnings: commissionAmount
        }
    });

    // Update affiliate referral record
    this.affiliateReferral.commissionEarned += commissionAmount;
    this.affiliateReferral.status = 'converted';
    await this.save();

    // Add transaction record
    this.transactionHistory.push({
        type: 'affiliate_commission',
        amount: commissionAmount,
        balanceBefore: this.balance,
        balanceAfter: this.balance,
        description: `Affiliate commission for ${transactionType}`,
        referenceId: `AFF-${Date.now()}`,
        affiliateId: affiliate._id
    });

    await this.save();

    return {
        affiliate: affiliate._id,
        commissionAmount,
        transactionType,
        userId: this._id
    };
};

// ========== WITHDRAWAL METHODS ==========
UserSchema.methods.canWithdraw = function(amount) {
    if (this.bonusBalance > 0) {
        return {
            canWithdraw: false,
            reason: "Active bonus balance must be cleared first"
        };
    }
    
    if (amount > this.balance) {
        return {
            canWithdraw: false,
            reason: "Insufficient balance"
        };
    }
    
    const status = this.wageringStatus;
    
    if (status.remaining > status.minRequired) {
        return {
            canWithdraw: true,
            reason: "Withdrawal allowed with 20% commission",
            commission: amount * BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE,
            netAmount: amount * (1 - BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE)
        };
    }
    
    return {
        canWithdraw: true,
        reason: "Withdrawal allowed",
        commission: 0,
        netAmount: amount
    };
};

// ========== BONUS SYSTEM METHODS ==========
UserSchema.methods.isEligibleForFirstDepositBonus = function() {
    return !this.bonusInfo.firstDepositBonusClaimed && this.total_deposit === 0;
};

UserSchema.methods.isEligibleForSpecialBonus = function() {
    const isNewUser = this.accountAgeInDays < BONUS_CONFIG.NEW_USER_ACCOUNT_AGE_DAYS;
    const hasNoActiveBonuses = this.bonusInfo.activeBonuses.length === 0;
    return isNewUser && hasNoActiveBonuses && (this.total_deposit === 0 || this.total_deposit < BONUS_CONFIG.MAX_DEPOSIT_AMOUNT);
};

UserSchema.methods.calculateBonusAmount = function(depositAmount, bonusType) {
    if (bonusType === 'first_deposit') {
        return depositAmount * BONUS_CONFIG.FIRST_DEPOSIT_BONUS_RATE;
    } else if (bonusType === 'special_bonus') {
        return depositAmount * BONUS_CONFIG.SPECIAL_BONUS_RATE;
    }
    return 0;
};

UserSchema.methods.getAvailableBonusOffers = function() {
    const offers = [];
    
    if (this.isEligibleForFirstDepositBonus()) {
        offers.push({
            type: 'first_deposit',
            name: 'First Deposit Bonus (3%)',
            description: 'Get 3% extra bonus on your first deposit',
            rate: BONUS_CONFIG.FIRST_DEPOSIT_BONUS_RATE
        });
    }
    
    if (this.isEligibleForSpecialBonus()) {
        offers.push({
            type: 'special_bonus',
            name: 'Special 150% Bonus',
            description: 'Get 150% bonus with 30x wagering requirement',
            rate: BONUS_CONFIG.SPECIAL_BONUS_RATE,
            wageringRequirement: BONUS_CONFIG.WAGERING_REQUIREMENT
        });
    }
    
    return offers;
};

// ========== DEPOSIT METHODS ==========
UserSchema.methods.createDeposit = async function({ method, amount, bonusType = 'none' }) {
    if (amount < BONUS_CONFIG.MIN_DEPOSIT_AMOUNT || amount > BONUS_CONFIG.MAX_DEPOSIT_AMOUNT) {
        throw new Error(`Deposit amount must be between ${BONUS_CONFIG.MIN_DEPOSIT_AMOUNT} and ${BONUS_CONFIG.MAX_DEPOSIT_AMOUNT} BDT`);
    }

    if (bonusType !== 'none') {
        if (bonusType === 'first_deposit' && !this.isEligibleForFirstDepositBonus()) {
            throw new Error('Not eligible for first deposit bonus');
        }
        if (bonusType === 'special_bonus' && !this.isEligibleForSpecialBonus()) {
            throw new Error('Not eligible for special bonus');
        }
    }

    const deposit = {
        method,
        amount,
        status: 'pending',
        bonusType,
        orderId: `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    this.depositHistory.push(deposit);
    await this.save();
    return deposit;
};

UserSchema.methods.completeDeposit = async function(orderId, transactionId) {
    const deposit = this.depositHistory.find(d => d.orderId === orderId && d.status === 'pending');
    
    if (!deposit) {
        throw new Error('Pending deposit not found');
    }

    let bonusAmount = 0;
    if (deposit.bonusType !== 'none') {
        bonusAmount = this.calculateBonusAmount(deposit.amount, deposit.bonusType);
    }

    deposit.status = 'completed';
    deposit.transactionId = transactionId;
    deposit.completedAt = new Date();
    deposit.bonusAmount = bonusAmount;
    deposit.bonusApplied = bonusAmount > 0;

    this.balance += deposit.amount;
    this.total_deposit += deposit.amount;

    // Award affiliate commission for deposit
    if (this.affiliateReferral) {
        await this.awardAffiliateCommission(deposit.amount, 'deposit');
    }

    if (bonusAmount > 0) {
        this.bonusBalance += bonusAmount;

        // Log bonus activity
        this.bonusActivityLogs.push({
            bonusType: deposit.bonusType,
            bonusAmount: bonusAmount,
            depositAmount: deposit.amount,
            activatedAt: new Date()
        });

        this.bonusInfo.activeBonuses.push({
            bonusType: deposit.bonusType,
            amount: bonusAmount,
            originalAmount: bonusAmount,
            wageringRequirement: BONUS_CONFIG.WAGERING_REQUIREMENT
        });

        if (deposit.bonusType === 'first_deposit' && !this.bonusInfo.firstDepositBonusClaimed) {
            this.bonusInfo.firstDepositBonusClaimed = true;
        }
    }

    this.transactionHistory.push({
        type: 'deposit',
        amount: deposit.amount,
        balanceBefore: this.balance - deposit.amount,
        balanceAfter: this.balance,
        description: `Deposit via ${deposit.method}`,
        referenceId: transactionId
    });

    await this.save();
    return deposit;
};

// ========== BONUS WAGERING METHODS ==========
UserSchema.methods.applyBetToWagering = async function(amount) {
    this.totalWagered += amount;
    this.total_bet += amount;

    // Award affiliate commission for betting activity
    if (this.affiliateReferral) {
        await this.awardAffiliateCommission(amount, 'bet');
    }

    if (this.bonusInfo.activeBonuses.length > 0) {
        for (const bonus of this.bonusInfo.activeBonuses) {
            if (bonus.status === 'active') {
                bonus.amountWagered += amount;
                
                if (bonus.amountWagered >= (bonus.originalAmount * bonus.wageringRequirement)) {
                    bonus.status = 'completed';
                }
            }
        }
        
        this.bonusInfo.activeBonuses = this.bonusInfo.activeBonuses.filter(b => b.status !== 'completed');
    }

    await this.save();
};

UserSchema.methods.cancelBonusWithPenalty = async function() {
    if (this.bonusBalance <= 0) {
        throw new Error('No active bonus to cancel');
    }

    const penaltyAmount = this.bonusBalance * 1.5;
    
    if (this.balance < penaltyAmount) {
        throw new Error('Insufficient balance to pay penalty');
    }

    this.balance -= penaltyAmount;
    
    // Cancel the bonus and log the activity
    const cancelledBonus = this.bonusInfo.activeBonuses.map(bonus => {
        bonus.status = 'cancelled';
        this.bonusActivityLogs.push({
            bonusType: bonus.bonusType,
            bonusAmount: bonus.amount,
            depositAmount: bonus.originalAmount,
            activatedAt: bonus.createdAt,
            cancelledAt: new Date(),
            status: 'cancelled'
        });
        return bonus;
    });

    this.bonusBalance = 0;
    
    this.transactionHistory.push({
        type: 'penalty',
        amount: penaltyAmount,
        balanceBefore: this.balance + penaltyAmount,
        balanceAfter: this.balance,
        description: 'Bonus cancellation penalty',
        referenceId: `PEN-${Date.now()}`
    });

    await this.save();
    return penaltyAmount;
};

// ========== STATIC METHODS ==========
UserSchema.statics.oneClickRegister = async function(username) {
    const existingUser = await this.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    return this.create({
        username,
        isOneClickUser: true,
        player_id: 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase()
    });
};

UserSchema.statics.findByCredentials = async function(username, password) {
    const user = await this.findOne({ username }).select('+password');
    if (!user) {
        throw new Error('Invalid login credentials');
    }

    const isPasswordMatch = await user.verifyPassword(password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }

    return user;
};

UserSchema.statics.findByEmailOrPhone = async function(emailOrPhone) {
    return this.findOne({
        $or: [
            { email: emailOrPhone },
            { phone: emailOrPhone }
        ]
    });
};

// Add password verification method
UserSchema.methods.verifyPassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Generate click ID helper function
function generateClickId() {
    return 'CLK' + Math.random().toString(36).substr(2, 12).toUpperCase();
}

// Generate player ID helper function
function generatePlayerId() {
    return 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

const User = mongoose.model('User', UserSchema);
const ClickTrack = mongoose.model('ClickTrack', clickTrackSchema);

module.exports = { User, ClickTrack };